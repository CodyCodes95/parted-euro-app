"use client";
import { useRouter } from "next/router";
import Script from "next/script";
import { useEffect } from "react";

const FacebookPixel = () => {
  const router = useRouter();

  useEffect(() => {
    // Initialize Facebook Pixel when component mounts
    if (typeof window !== "undefined") {
      void import("react-facebook-pixel")
        .then((x) => x.default)
        .then((ReactPixel) => {
          ReactPixel.init("1009808854280120"); // Replace with your Pixel ID
          ReactPixel.pageView();

          // Track page views on route changes
          router.events.on("routeChangeComplete", () => {
            ReactPixel.pageView();
          });
        });
    }
  }, [router.events]);

  return (
    <>
      {/* Meta Pixel Code */}
      <Script id="facebook-pixel" strategy="afterInteractive">
        {`
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '1009808854280120');
          fbq('track', 'PageView');
        `}
      </Script>
      {/* Noscript fallback */}
      <noscript>
        <img
          height="1"
          width="1"
          style={{ display: "none" }}
          src={`https://www.facebook.com/tr?id=1009808854280120&ev=PageView&noscript=1`}
          alt=""
        />
      </noscript>
    </>
  );
};

export default FacebookPixel;