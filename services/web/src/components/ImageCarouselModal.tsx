import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "./ui/carousel";
import { Dialog, DialogContent } from "./ui/dialog";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ImageCarouselModalProps {
  images: string[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ImageCarouselModal({ images, open, onOpenChange }: ImageCarouselModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[80vh] bg-transparent border-none shadow-none flex items-center justify-center p-0">
        <Carousel className="w-full h-full">
          <CarouselContent>
            {images.map((src, index) => (
              <CarouselItem key={index} className="flex items-center justify-center">
                <ImageWithFallback
                  src={src}
                  alt={`Study spot image ${index + 1}`}
                  className="max-h-[80vh] w-auto h-auto object-contain rounded-lg"
                />
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="absolute left-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" />
          <CarouselNext className="absolute right-2 top-1/2 -translate-y-1/2 text-white bg-black/30 hover:bg-black/50" />
        </Carousel>
      </DialogContent>
    </Dialog>
  );
}