const Footer = () => {
  return (
    <footer className="bg-background border-t">
      <div className="container mx-auto py-4 text-center text-sm text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} Monogatari Weavers. All rights reserved.</p>
      </div>
    </footer>
  );
};

export default Footer; 