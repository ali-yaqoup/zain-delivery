"use client";

import { useEffect, useMemo, useState } from "react";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { stores as baseStores } from "@/lib/stores";
import { formatPrice } from "@/lib/stores";
import type { SiteSettings, StoreProfilePatch } from "@/lib/site-settings";
import type { MenuItem, MenuSize } from "@/lib/types";
import { StoreGlyph } from "@/components/icons";

type Section =
  | "brand"
  | "home"
  | "delivery"
  | "stores"
  | "king"
  | "mutawa"
  | "footer";

export type AdminSettingsSection = Section;

export const ADMIN_SETTINGS_SECTIONS: { id: Section; label: string }[] = [
  { id: "brand", label: "الهوية" },
  { id: "home", label: "الرئيسية" },
  { id: "delivery", label: "التوصيل" },
  { id: "stores", label: "المحلات" },
  { id: "king", label: "منيو كينج" },
  { id: "mutawa", label: "ميني ماركت" },
  { id: "footer", label: "الفوتر" },
];

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="text-muted">{label}</span>
      {children}
    </label>
  );
}

const inputClass =
  "w-full rounded-lg border border-border bg-canvas px-3 py-2 outline-none focus:border-brand";

export function AdminSettingsPanel({
  adminEmail,
  adminPassword,
  section,
}: {
  adminEmail: string;
  adminPassword: string;
  section: Section;
}) {
  const { settings, stores, saveSettings, refresh } = useSiteSettings();
  const [draft, setDraft] = useState<SiteSettings>(settings);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [mutawaQuery, setMutawaQuery] = useState("");
  const [mutawaResults, setMutawaResults] = useState<MenuItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [kingFilter, setKingFilter] = useState("");

  useEffect(() => {
    setDraft(settings);
  }, [settings]);

  const kingMenu = useMemo(() => {
    if (draft.kingMenu?.length) return draft.kingMenu;
    return baseStores.find((s) => s.id === "king-pizza")?.menu || [];
  }, [draft.kingMenu]);

  function patchContent(partial: Partial<SiteSettings["content"]>) {
    setDraft((prev) => ({
      ...prev,
      content: { ...prev.content, ...partial },
    }));
  }

  function patchStore(
    id: "king-pizza" | "mutawa-market" | "vegetables",
    partial: StoreProfilePatch
  ) {
    setDraft((prev) => ({
      ...prev,
      storeProfiles: {
        ...prev.storeProfiles,
        [id]: { ...prev.storeProfiles[id], ...partial },
      },
    }));
  }

  function ensureKingMenu(): MenuItem[] {
    if (draft.kingMenu?.length) return draft.kingMenu;
    return structuredClone(
      baseStores.find((s) => s.id === "king-pizza")?.menu || []
    );
  }

  function setKingMenu(menu: MenuItem[]) {
    setDraft((prev) => ({ ...prev, kingMenu: menu }));
  }

  function updateKingItem(index: number, patch: Partial<MenuItem>) {
    const menu = ensureKingMenu();
    menu[index] = { ...menu[index], ...patch };
    setKingMenu(menu);
  }

  function updateKingSize(
    itemIndex: number,
    sizeIndex: number,
    patch: Partial<MenuSize>
  ) {
    const menu = ensureKingMenu();
    const item = menu[itemIndex];
    if (!item.sizes) return;
    const sizes = [...item.sizes];
    sizes[sizeIndex] = { ...sizes[sizeIndex], ...patch };
    menu[itemIndex] = { ...item, sizes };
    setKingMenu(menu);
  }

  function addKingItem() {
    const menu = ensureKingMenu();
    menu.unshift({
      id: `kp-custom-${Date.now()}`,
      name: "صنف جديد",
      description: "",
      price: 10,
      category: "مقبلات",
      image: "",
    });
    setKingMenu(menu);
  }

  function removeKingItem(index: number) {
    const menu = ensureKingMenu();
    menu.splice(index, 1);
    setKingMenu(menu);
  }

  async function searchMutawa() {
    const q = mutawaQuery.trim();
    if (!q) {
      setMutawaResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `/api/catalog/mutawa?q=${encodeURIComponent(q)}&limit=20&admin=1`,
        {
          headers: {
            "x-admin-email": adminEmail.trim().toLowerCase(),
            "x-admin-key": adminPassword,
          },
        }
      );
      const data = await res.json();
      if (res.ok) setMutawaResults(data.items || []);
    } catch {
      setMutawaResults([]);
    } finally {
      setSearching(false);
    }
  }

  function patchMutawa(itemId: string, partial: Record<string, unknown>) {
    setDraft((prev) => ({
      ...prev,
      mutawaOverrides: {
        ...prev.mutawaOverrides,
        [itemId]: {
          ...prev.mutawaOverrides[itemId],
          ...partial,
        },
      },
    }));
  }

  async function onSave() {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      // Persist current king menu view if edited via ensure
      const toSave: SiteSettings = {
        ...draft,
        kingMenu: draft.kingMenu?.length ? draft.kingMenu : draft.kingMenu,
      };
      await saveSettings(toSave, adminEmail, adminPassword);
      await refresh();
      setMessage("تم حفظ كل التعديلات — الموقع محدّث فوراً");
    } catch (err) {
      setError(err instanceof Error ? err.message : "فشل الحفظ");
    } finally {
      setSaving(false);
    }
  }

  const filteredKing = kingMenu.filter(
    (item) =>
      !kingFilter.trim() ||
      item.name.includes(kingFilter.trim()) ||
      item.category.includes(kingFilter.trim())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">تعديل الموقع</h2>
          <p className="text-sm text-muted">
            غيّر النصوص والأسعار والمحلات والتوصيل من هنا
          </p>
        </div>
        <button
          type="button"
          onClick={onSave}
          disabled={saving}
          className="rounded-xl bg-brand px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-hover disabled:opacity-60"
        >
          {saving ? "جارٍ الحفظ..." : "حفظ التعديلات"}
        </button>
      </div>

      {message && (
        <p className="rounded-xl border border-success/30 bg-success/10 px-4 py-2 text-sm text-success">
          {message}
        </p>
      )}
      {error && (
        <p className="rounded-xl border border-danger/30 bg-danger/10 px-4 py-2 text-sm text-danger">
          {error}
        </p>
      )}

      {section === "brand" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold">هوية الموقع</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="الاسم بالعربي">
              <input
                className={inputClass}
                value={draft.content.brandNameAr}
                onChange={(e) => patchContent({ brandNameAr: e.target.value })}
              />
            </Field>
            <Field label="الاسم بالإنجليزي">
              <input
                className={inputClass}
                value={draft.content.brandNameEn}
                onChange={(e) => patchContent({ brandNameEn: e.target.value })}
              />
            </Field>
            <Field label="سطر تحت الشعار (الهيدر)">
              <input
                className={inputClass}
                value={draft.content.headerSubtitle}
                onChange={(e) =>
                  patchContent({ headerSubtitle: e.target.value })
                }
              />
            </Field>
            <Field label="ملاحظة الدفع">
              <input
                className={inputClass}
                value={draft.content.paymentNote}
                onChange={(e) => patchContent({ paymentNote: e.target.value })}
              />
            </Field>
          </div>
        </section>
      )}

      {section === "home" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold">صفحة الرئيسية</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="سطر فوق العنوان">
              <input
                className={inputClass}
                value={draft.content.heroEyebrow}
                onChange={(e) => patchContent({ heroEyebrow: e.target.value })}
              />
            </Field>
            <Field label="العنوان الكبير">
              <input
                className={inputClass}
                value={draft.content.heroHeadline}
                onChange={(e) => patchContent({ heroHeadline: e.target.value })}
              />
            </Field>
            <Field label="الوصف تحت العنوان">
              <textarea
                rows={2}
                className={inputClass}
                value={draft.content.heroSubcopy}
                onChange={(e) => patchContent({ heroSubcopy: e.target.value })}
              />
            </Field>
            <Field label="رابط صورة الهيرو">
              <input
                className={inputClass}
                value={draft.content.heroImage}
                onChange={(e) => patchContent({ heroImage: e.target.value })}
              />
            </Field>
            <Field label="زر الطلب">
              <input
                className={inputClass}
                value={draft.content.ctaPrimary}
                onChange={(e) => patchContent({ ctaPrimary: e.target.value })}
              />
            </Field>
            <Field label="زر التتبع">
              <input
                className={inputClass}
                value={draft.content.ctaSecondary}
                onChange={(e) => patchContent({ ctaSecondary: e.target.value })}
              />
            </Field>
            <Field label="عنوان قسم المحلات">
              <input
                className={inputClass}
                value={draft.content.homeSectionTitle}
                onChange={(e) =>
                  patchContent({ homeSectionTitle: e.target.value })
                }
              />
            </Field>
            <Field label="وصف قسم المحلات">
              <input
                className={inputClass}
                value={draft.content.homeSectionSubtitle}
                onChange={(e) =>
                  patchContent({ homeSectionSubtitle: e.target.value })
                }
              />
            </Field>
            <Field label="عنوان صفحة المحلات">
              <input
                className={inputClass}
                value={draft.content.storesPageTitle}
                onChange={(e) =>
                  patchContent({ storesPageTitle: e.target.value })
                }
              />
            </Field>
            <Field label="وصف صفحة المحلات">
              <input
                className={inputClass}
                value={draft.content.storesPageSubtitle}
                onChange={(e) =>
                  patchContent({ storesPageSubtitle: e.target.value })
                }
              />
            </Field>
          </div>

          <h4 className="pt-2 font-semibold">خطوات كيف تطلب</h4>
          <div className="space-y-3">
            {draft.content.homeSteps.map((step, i) => (
              <div
                key={i}
                className="grid gap-2 rounded-xl border border-border bg-surface-2 p-3 sm:grid-cols-[4rem_1fr_1.4fr]"
              >
                <input
                  className={inputClass}
                  value={step.icon}
                  onChange={(e) => {
                    const homeSteps = [...draft.content.homeSteps];
                    homeSteps[i] = { ...step, icon: e.target.value };
                    patchContent({ homeSteps });
                  }}
                />
                <input
                  className={inputClass}
                  value={step.title}
                  onChange={(e) => {
                    const homeSteps = [...draft.content.homeSteps];
                    homeSteps[i] = { ...step, title: e.target.value };
                    patchContent({ homeSteps });
                  }}
                />
                <input
                  className={inputClass}
                  value={step.text}
                  onChange={(e) => {
                    const homeSteps = [...draft.content.homeSteps];
                    homeSteps[i] = { ...step, text: e.target.value };
                    patchContent({ homeSteps });
                  }}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {section === "delivery" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">مناطق وأسعار التوصيل</h3>
            <button
              type="button"
              onClick={() =>
                setDraft((prev) => ({
                  ...prev,
                  deliveryZones: [
                    ...prev.deliveryZones,
                    { name: "قرية جديدة", fee: 5 },
                  ],
                }))
              }
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm"
            >
              + إضافة قرية
            </button>
          </div>
          <div className="space-y-2">
            {draft.deliveryZones.map((zone, i) => (
              <div
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface-2 p-3"
              >
                <input
                  className={`${inputClass} min-w-[10rem] flex-1`}
                  value={zone.name}
                  onChange={(e) => {
                    const deliveryZones = [...draft.deliveryZones];
                    deliveryZones[i] = { ...zone, name: e.target.value };
                    setDraft((prev) => ({ ...prev, deliveryZones }));
                  }}
                />
                <input
                  type="number"
                  min={0}
                  className="w-24 rounded-lg border border-border bg-canvas px-2 py-2 text-center font-mono outline-none focus:border-brand"
                  value={zone.fee}
                  onChange={(e) => {
                    const deliveryZones = [...draft.deliveryZones];
                    deliveryZones[i] = {
                      ...zone,
                      fee: Math.max(0, Number(e.target.value) || 0),
                    };
                    setDraft((prev) => ({ ...prev, deliveryZones }));
                  }}
                />
                <span className="text-xs text-muted">₪</span>
                <button
                  type="button"
                  disabled={draft.deliveryZones.length <= 1}
                  onClick={() =>
                    setDraft((prev) => ({
                      ...prev,
                      deliveryZones: prev.deliveryZones.filter(
                        (_, idx) => idx !== i
                      ),
                    }))
                  }
                  className="rounded-lg border border-danger/40 px-2 py-1 text-xs text-danger disabled:opacity-40"
                >
                  حذف
                </button>
              </div>
            ))}
          </div>
          <Field label="القرية الافتراضية">
            <select
              className={inputClass}
              value={draft.defaultVillage}
              onChange={(e) =>
                setDraft((prev) => ({
                  ...prev,
                  defaultVillage: e.target.value,
                }))
              }
            >
              {draft.deliveryZones.map((z) => (
                <option key={z.name} value={z.name}>
                  {z.name}
                </option>
              ))}
            </select>
          </Field>
        </section>
      )}

      {section === "stores" && (
        <section className="space-y-4">
          {(["king-pizza", "mutawa-market", "vegetables"] as const).map((id) => {
            const base = baseStores.find((s) => s.id === id)!;
            const live = stores.find((s) => s.id === id) || base;
            const patch = draft.storeProfiles[id] || {};
            const value = <K extends keyof StoreProfilePatch>(key: K, fallback: NonNullable<StoreProfilePatch[K]>) =>
              (patch[key] ?? fallback) as NonNullable<StoreProfilePatch[K]>;

            return (
              <div
                key={id}
                className="space-y-3 rounded-2xl border border-border bg-surface p-5"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-bold inline-flex items-center gap-2">
                    <StoreGlyph storeId={id} size={18} className="text-brand" />
                    {live.name}
                  </p>
                  <label className="flex items-center gap-2 text-sm text-muted">
                    <input
                      type="checkbox"
                      checked={patch.enabled !== false}
                      onChange={(e) =>
                        patchStore(id, { enabled: e.target.checked })
                      }
                    />
                    ظاهر في الموقع
                  </label>
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Field label="الاسم">
                    <input
                      className={inputClass}
                      value={value("name", base.name)}
                      onChange={(e) => patchStore(id, { name: e.target.value })}
                    />
                  </Field>
                  <Field label="الاسم الإنجليزي">
                    <input
                      className={inputClass}
                      value={value("nameEn", base.nameEn)}
                      onChange={(e) =>
                        patchStore(id, { nameEn: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="الشعار القصير">
                    <input
                      className={inputClass}
                      value={value("tagline", base.tagline)}
                      onChange={(e) =>
                        patchStore(id, { tagline: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="وقت التوصيل">
                    <input
                      className={inputClass}
                      value={value("deliveryMinutes", base.deliveryMinutes)}
                      onChange={(e) =>
                        patchStore(id, { deliveryMinutes: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="الحد الأدنى (₪)">
                    <input
                      type="number"
                      className={inputClass}
                      value={value("minOrder", base.minOrder)}
                      onChange={(e) =>
                        patchStore(id, {
                          minOrder: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </Field>
                  <Field label="التقييم">
                    <input
                      type="number"
                      step="0.1"
                      className={inputClass}
                      value={value("rating", base.rating)}
                      onChange={(e) =>
                        patchStore(id, {
                          rating: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                  </Field>
                  <Field label="ساعات العمل (نص)">
                    <input
                      className={inputClass}
                      value={value("openHours", base.openHours)}
                      onChange={(e) =>
                        patchStore(id, { openHours: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="يفتح الساعة (HH:mm)">
                    <input
                      className={inputClass}
                      placeholder="08:00"
                      value={value("opensAt", base.opensAt || "")}
                      onChange={(e) =>
                        patchStore(id, { opensAt: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="يغلق الساعة (HH:mm)">
                    <input
                      className={inputClass}
                      placeholder="01:00"
                      value={value("closesAt", base.closesAt || "")}
                      onChange={(e) =>
                        patchStore(id, { closesAt: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="صورة الغلاف (رابط)">
                    <input
                      className={inputClass}
                      value={value("coverImage", base.coverImage)}
                      onChange={(e) =>
                        patchStore(id, { coverImage: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="الوصف">
                    <textarea
                      rows={3}
                      className={inputClass}
                      value={value("description", base.description)}
                      onChange={(e) =>
                        patchStore(id, { description: e.target.value })
                      }
                    />
                  </Field>
                  <Field label="التاغات (مفصولة بفاصلة)">
                    <input
                      className={inputClass}
                      value={(patch.tags ?? base.tags).join("، ")}
                      onChange={(e) =>
                        patchStore(id, {
                          tags: e.target.value
                            .split(/[،,]/)
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </Field>
                  <Field label="أرقام الهاتف (سطر لكل رقم)">
                    <textarea
                      rows={2}
                      className={inputClass}
                      value={(patch.phones ?? base.phones ?? []).join("\n")}
                      onChange={(e) =>
                        patchStore(id, {
                          phones: e.target.value
                            .split("\n")
                            .map((t) => t.trim())
                            .filter(Boolean),
                        })
                      }
                    />
                  </Field>
                </div>
              </div>
            );
          })}
        </section>
      )}

      {section === "king" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-bold">منيو كينج بيتزا</h3>
            <button
              type="button"
              onClick={addKingItem}
              className="rounded-lg border border-border bg-surface-2 px-3 py-1.5 text-sm"
            >
              + صنف جديد
            </button>
          </div>
          <input
            className={inputClass}
            placeholder="بحث في المنير..."
            value={kingFilter}
            onChange={(e) => setKingFilter(e.target.value)}
          />
          <div className="max-h-[36rem] space-y-3 overflow-y-auto pe-1">
            {filteredKing.map((item) => {
              const index = kingMenu.findIndex((x) => x.id === item.id);
              return (
                <div
                  key={item.id}
                  className="space-y-2 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <input
                      className={`${inputClass} max-w-xs font-semibold`}
                      value={item.name}
                      onChange={(e) =>
                        updateKingItem(index, { name: e.target.value })
                      }
                    />
                    <button
                      type="button"
                      onClick={() => removeKingItem(index)}
                      className="text-xs text-danger"
                    >
                      حذف الصنف
                    </button>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-2">
                    <input
                      className={inputClass}
                      placeholder="التصنيف"
                      value={item.category}
                      onChange={(e) =>
                        updateKingItem(index, { category: e.target.value })
                      }
                    />
                    <input
                      className={inputClass}
                      placeholder="رابط الصورة"
                      value={item.image}
                      onChange={(e) =>
                        updateKingItem(index, { image: e.target.value })
                      }
                    />
                  </div>
                  <textarea
                    rows={2}
                    className={inputClass}
                    placeholder="الوصف"
                    value={item.description}
                    onChange={(e) =>
                      updateKingItem(index, { description: e.target.value })
                    }
                  />
                  {item.sizes?.length ? (
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                      {item.sizes.map((size, si) => (
                        <label key={size.id} className="space-y-1 text-xs">
                          <span className="text-muted">{size.labelAr}</span>
                          <input
                            type="number"
                            className={inputClass}
                            value={size.price}
                            onChange={(e) =>
                              updateKingSize(index, si, {
                                price: Math.max(0, Number(e.target.value) || 0),
                              })
                            }
                          />
                        </label>
                      ))}
                    </div>
                  ) : (
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-muted">السعر</span>
                      <input
                        type="number"
                        className="w-28 rounded-lg border border-border bg-canvas px-2 py-1.5 font-mono outline-none focus:border-brand"
                        value={item.price ?? 0}
                        onChange={(e) =>
                          updateKingItem(index, {
                            price: Math.max(0, Number(e.target.value) || 0),
                          })
                        }
                      />
                      <span className="text-muted">₪</span>
                    </label>
                  )}
                  <label className="flex items-center gap-2 text-xs text-muted">
                    <input
                      type="checkbox"
                      checked={Boolean(item.popular)}
                      onChange={(e) =>
                        updateKingItem(index, { popular: e.target.checked })
                      }
                    />
                    صنف مميز
                  </label>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {section === "mutawa" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold">تعديل أصناف الميني ماركت</h3>
          <p className="text-xs text-muted">
            ابحث عن أي صنف وعدّل الاسم أو السعر أو اخفيه من الموقع
          </p>
          <div className="flex flex-wrap gap-2">
            <input
              type="search"
              value={mutawaQuery}
              onChange={(e) => setMutawaQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && searchMutawa()}
              placeholder="ابحث باسم المنتج..."
              className={`${inputClass} min-w-[14rem] flex-1`}
            />
            <button
              type="button"
              onClick={searchMutawa}
              disabled={searching}
              className="rounded-xl border border-border bg-surface-2 px-4 py-2.5 text-sm"
            >
              {searching ? "..." : "بحث"}
            </button>
          </div>
          <div className="space-y-2">
            {mutawaResults.map((item) => {
              const ov = draft.mutawaOverrides[item.id] || {};
              return (
                <div
                  key={item.id}
                  className="space-y-2 rounded-xl border border-border bg-surface-2 p-3"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs text-soft">
                      {item.category} · الأصلي {formatPrice(item.price || 0)}
                    </p>
                    <label className="flex items-center gap-2 text-xs text-muted">
                      <input
                        type="checkbox"
                        checked={Boolean(ov.hidden)}
                        onChange={(e) =>
                          patchMutawa(item.id, { hidden: e.target.checked })
                        }
                      />
                      مخفي
                    </label>
                  </div>
                  <input
                    className={inputClass}
                    value={ov.name ?? item.name}
                    onChange={(e) =>
                      patchMutawa(item.id, { name: e.target.value })
                    }
                  />
                  <div className="flex flex-wrap items-center gap-2">
                    <input
                      type="number"
                      className="w-28 rounded-lg border border-border bg-canvas px-2 py-1.5 font-mono outline-none focus:border-brand"
                      value={ov.price ?? item.price ?? 0}
                      onChange={(e) =>
                        patchMutawa(item.id, {
                          price: Math.max(0, Number(e.target.value) || 0),
                        })
                      }
                    />
                    <span className="text-xs text-muted">₪</span>
                    <input
                      className={`${inputClass} flex-1`}
                      placeholder="التصنيف"
                      value={ov.category ?? item.category}
                      onChange={(e) =>
                        patchMutawa(item.id, { category: e.target.value })
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {section === "footer" && (
        <section className="space-y-4 rounded-2xl border border-border bg-surface p-5">
          <h3 className="font-bold">الفوتر</h3>
          <Field label="نص تعريف الفوتر">
            <textarea
              rows={3}
              className={inputClass}
              value={draft.content.footerBlurb}
              onChange={(e) => patchContent({ footerBlurb: e.target.value })}
            />
          </Field>
          <Field label="سطور خدمة التوصيل (سطر لكل نقطة)">
            <textarea
              rows={4}
              className={inputClass}
              value={draft.content.footerServiceLines.join("\n")}
              onChange={(e) =>
                patchContent({
                  footerServiceLines: e.target.value
                    .split("\n")
                    .map((l) => l.trim())
                    .filter(Boolean),
                })
              }
            />
          </Field>
          <Field label="نهاية حقوق النشر">
            <input
              className={inputClass}
              value={draft.content.copyrightSuffix}
              onChange={(e) =>
                patchContent({ copyrightSuffix: e.target.value })
              }
            />
          </Field>
        </section>
      )}

      <button
        type="button"
        onClick={onSave}
        disabled={saving}
        className="w-full rounded-xl bg-brand py-3 font-bold text-white hover:bg-brand-hover disabled:opacity-60"
      >
        {saving ? "جارٍ الحفظ..." : "حفظ كل التعديلات"}
      </button>
    </div>
  );
}
