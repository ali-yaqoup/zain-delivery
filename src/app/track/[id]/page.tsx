import { Suspense } from "react";
import TrackOrderPage from "./TrackOrderClient";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-2xl px-4 py-20 text-center text-muted">
          جارٍ تحميل الطلب...
        </div>
      }
    >
      <TrackOrderPage />
    </Suspense>
  );
}
