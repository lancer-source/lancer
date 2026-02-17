export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-slate-200 bg-white py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold text-brand-600 font-display">Lancer</span>
          </div>
          <p className="text-sm text-slate-500">
            &copy; {currentYear} Lancer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
