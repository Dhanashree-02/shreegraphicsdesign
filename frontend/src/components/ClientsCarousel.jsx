import React from "react";
import Slider from "react-slick";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

import Shreegraphicsdesignlogo from '../assets/images/shreegraphics.png'
import QMSLogo from '../assets/images/QMS.png'
import NewageLogo from '../assets/images/Newage.png'
import NexusLogo from '../assets/images/Nexus.png'
import NimbjaLogo from '../assets/images/Nimbja.png'
import SmartMatrixLogo from '../assets/images/SmartMatrix.png'
import SmartSoftwareServicesLogo from '../assets/images/SmartSoftwareServices.png'
import Client1 from '../assets/images/generated-image.png'

// Mock logo data
const clientLogos = [
  { src: Shreegraphicsdesignlogo, alt: "Shreegraphicsdesignlogo" },
  { src: QMSLogo, alt: "QMSLogo" },
  { src: Client1, alt: "Client1" },
  { src: NewageLogo, alt: "NewageLogo" },
  { src: NexusLogo, alt: "NexusLogo" },
  { src: NimbjaLogo, alt: "NimbjaLogo" },
  { src: SmartMatrixLogo, alt: "SmartMatrixLogo" },
  { src: SmartSoftwareServicesLogo, alt: "SmartSoftwareServicesLogo" },
];

const ClientsCarousel = () => {
  const settings = {
  infinite: true,
  slidesToShow: 5,
  slidesToScroll: 1,
  autoplay: true,
  autoplaySpeed: 1500, // speed between auto-scrolls, adjust as needed
  speed: 1000,         // animation speed of slide change
  cssEase: "linear",   // smooth linear scroll instead of ease-in-out
  arrows: false,
  dots: false,
  responsive: [
    { breakpoint: 1280, settings: { slidesToShow: 4 } },
    { breakpoint: 1024, settings: { slidesToShow: 3 } },
    { breakpoint: 640, settings: { slidesToShow: 2 } },
    { breakpoint: 400, settings: { slidesToShow: 1 } },
  ],
};

  return (
    <section className="py-16 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Our Happy Clients</h2>
          <p className="text-lg text-gray-600">Trusted by leading brands</p>
        </div>
        <Slider {...settings}>
          {clientLogos.map((logo, idx) => (
            <div key={idx} className="flex items-center justify-center px-4">
              <img
                src={logo.src}
                alt={logo.alt}
                className="h-16 object-contain transition"
              />
            </div>
          ))}
        </Slider>
      </div>
    </section>
  );
};

export default ClientsCarousel;
