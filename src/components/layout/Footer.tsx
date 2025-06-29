const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Monogatari Weavers. 全ての権利を保有します。</p>
      </div>
    </footer>
  );
};

export default Footer; 