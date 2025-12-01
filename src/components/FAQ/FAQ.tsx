// FAQ Component for SEO

import { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { Card } from '@/components/ui/card';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: "Why should I use ImageKit to compress my images?",
    answer: "ImageKit uses 100% local processing, which means your images never leave your device. This ensures maximum privacy while providing excellent compression ratios. Unlike other tools, all processing happens in your browser using advanced algorithms, making it faster and more secure. You'll get optimized images for faster websites without compromising on quality or privacy."
  },
  {
    question: "How does image compression work in ImageKit?",
    answer: "ImageKit uses smart lossy compression techniques to reduce file sizes. The algorithm analyzes each image's colors, textures, and patterns to determine optimal compression settings. By selectively reducing color data and removing unnecessary metadata, we achieve significant file size reductions (often 50-80%) while maintaining visual quality that's nearly identical to the original."
  },
  {
    question: "What image formats does ImageKit support?",
    answer: "ImageKit supports the most popular web image formats: JPEG/JPG, PNG, and WebP. You can compress images in any of these formats, convert between them, and even batch process multiple images at once. WebP is particularly recommended for web use as it offers superior compression while maintaining high quality."
  },
  {
    question: "Is my privacy protected when using ImageKit?",
    answer: "Absolutely! ImageKit processes everything locally in your browser - your images are NEVER uploaded to any server. This is our biggest advantage over competitors like TinyPNG. All compression, conversion, and editing happens on your device, ensuring 100% privacy. Your files stay on your computer at all times."
  },
  {
    question: "Can I compress images for free?",
    answer: "Yes! ImageKit is completely free to use with no limits on the number of images or file sizes. You can compress, convert, resize, crop, and add watermarks to as many images as you want, all for free. There are no hidden fees, subscriptions, or premium features - everything is available to everyone."
  },
  {
    question: "How much can I reduce my image file size?",
    answer: "Typically, you can reduce image file sizes by 50-80% depending on the original image and your quality settings. JPEG images usually compress very well, while PNG images with transparency may have slightly lower compression ratios. Our smart algorithm ensures you get the best balance between file size and visual quality."
  },
  {
    question: "What is the difference between ImageKit and TinyPNG?",
    answer: "The main difference is privacy and processing location. TinyPNG requires uploading your images to their servers, while ImageKit processes everything locally in your browser. This means: 1) Your images never leave your device, 2) Faster processing (no upload/download time), 3) No file size limits, 4) Works offline once loaded, and 5) Complete privacy. Both offer excellent compression, but ImageKit keeps you in control."
  },
  {
    question: "Does ImageKit work offline?",
    answer: "Yes! Once you load ImageKit in your browser, you can continue using it even without an internet connection. Since all processing happens locally, you don't need to be online to compress, convert, or edit your images. This makes it perfect for working in environments with limited connectivity."
  },
  {
    question: "Can I batch process multiple images at once?",
    answer: "Yes! ImageKit supports batch processing for all operations - compression, format conversion, resizing, and more. Simply drag and drop multiple images at once, adjust your settings, and process them all together. This saves significant time when working with many images."
  },
  {
    question: "Should I convert my images to WebP format?",
    answer: "WebP is highly recommended for modern websites. It typically offers 25-35% better compression than JPEG while maintaining the same quality, and supports transparency like PNG but with smaller file sizes. All modern browsers support WebP, making it an excellent choice for faster page loads and better SEO."
  },
  {
    question: "How does ImageKit help with website performance and SEO?",
    answer: "Smaller image files mean faster page load times, which is a crucial factor for both user experience and SEO. Google's Core Web Vitals consider page speed as a ranking factor. By reducing image sizes by 50-80%, ImageKit helps you achieve better LCP (Largest Contentful Paint) scores, lower bounce rates, and improved search engine rankings."
  },
  {
    question: "Are there any file size limits?",
    answer: "No! Since ImageKit processes images locally in your browser, there are no server-imposed file size limits. You can process images of any size, limited only by your device's available memory. This is another advantage over cloud-based tools that typically restrict file sizes."
  },
  {
    question: "Can I resize images to specific dimensions?",
    answer: "Yes! ImageKit includes a powerful resizing tool that lets you: 1) Set exact pixel dimensions, 2) Scale by percentage, 3) Use preset sizes (like 1920x1080, 1280x720), 4) Maintain or ignore aspect ratio, and 5) Batch resize multiple images with the same settings."
  },
  {
    question: "How do I add watermarks to my images?",
    answer: "ImageKit offers flexible watermarking options. You can add text watermarks with customizable font size, color, and opacity, or image watermarks (like logos). Position watermarks anywhere on the image, adjust transparency, and apply them to single or multiple images at once. Perfect for protecting copyrights or branding."
  },
  {
    question: "What is the quality setting and how should I use it?",
    answer: "The quality setting (1-100) controls the compression level. Higher values mean better quality but larger files. We recommend: 85-95 for photos you want to preserve detail, 75-85 for general web use (good balance), 60-75 for thumbnails or less critical images. The preview lets you see the difference before downloading."
  },
  {
    question: "Can I crop images with ImageKit?",
    answer: "Yes! ImageKit includes a visual crop tool with preset aspect ratios (1:1, 16:9, 4:3, etc.) or free-form cropping. You can also rotate images and scale them before cropping. The real-time preview shows exactly what your final image will look like."
  },
  {
    question: "How does local processing make ImageKit faster?",
    answer: "Local processing eliminates upload and download times. Instead of sending your image to a server, waiting for processing, and downloading the result, everything happens instantly on your device. For large images or batch operations, this can save minutes or even hours compared to server-based tools."
  },
  {
    question: "Will compressed images look different from the originals?",
    answer: "Our smart compression algorithm is designed to minimize visible differences. At recommended quality settings (80-95), most people cannot tell the difference between the original and compressed images. The preview feature lets you compare before and after, so you can find the perfect balance for your needs."
  },
  {
    question: "Can I use ImageKit for commercial projects?",
    answer: "Absolutely! ImageKit is free for both personal and commercial use. You can use it for client work, business websites, e-commerce stores, or any other commercial purpose without restrictions or attribution requirements."
  },
  {
    question: "Does ImageKit remove metadata from images?",
    answer: "Yes, ImageKit removes EXIF and other metadata during compression by default. This reduces file size and protects privacy (location data, camera settings, etc.). If you need to preserve specific metadata for professional photography or legal reasons, the original files remain unchanged on your device."
  }
];

export function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Frequently Asked Questions
          </h2>
          <p className="text-lg text-muted-foreground">
            Everything you need to know about ImageKit image compression
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, index) => (
            <Card key={index} className="overflow-hidden">
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <h3 className="text-base sm:text-lg font-semibold pr-8">
                  {faq.question}
                </h3>
                <ChevronDown
                  className={`w-5 h-5 text-gray-500 transition-transform flex-shrink-0 ${
                    openIndex === index ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              
              {openIndex === index && (
                <div className="px-6 pb-4 pt-0">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-600">
            Still have questions?{' '}
            <a href="mailto:support@imagekit.app" className="text-blue-600 hover:underline font-medium">
              Contact us
            </a>
          </p>
        </div>
      </div>
    </section>
  );
}
