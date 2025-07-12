// src/components/HeroSection.jsx
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const HeroSection = () => {
  return (
    <section className="py-20 text-center bg-gradient-to-br from-blue-50 to-white">
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
        ReWear – Community Clothing Exchange
      </h1>
      <p className="max-w-xl mx-auto text-lg text-muted-foreground mb-6">
        Swap your unused clothes or redeem them for points. Help reduce textile waste and support sustainable fashion.
      </p>
      <div className="flex justify-center gap-4">
        <Link to="/browse">
          <Button size="lg">Start Swapping</Button>
        </Link>
        <Link to="/add-item">
          <Button size="lg" variant="outline">
            List an Item
          </Button>
        </Link>
      </div>
    </section>
  );
};

export default HeroSection;
