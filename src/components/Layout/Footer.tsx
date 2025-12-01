// 页脚组件

export function Footer() {
  return (
    <footer className="border-t mt-auto bg-muted/30">
      <div className="container mx-auto px-4 py-4 sm:py-6 text-center text-xs sm:text-sm text-muted-foreground">
        <p className="px-2"> 2024 ImageKit. 100% Free, Local Processing, Privacy Protected.</p>
        <p className="mt-1 sm:mt-2">
          Saved <span className="font-bold text-primary">1.2TB</span> storage space for users
        </p>
      </div>
    </footer>
  );
}
