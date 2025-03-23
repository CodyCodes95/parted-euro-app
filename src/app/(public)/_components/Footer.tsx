import React from "react";
import { FaFacebookSquare } from "react-icons/fa";
import { FiInstagram } from "react-icons/fi";
import Link from "next/link";

const Footer = () => {
  return (
    <footer className="flex w-full flex-col items-center justify-around border-t border-border bg-muted p-6">
      <div className="flex flex-col items-center justify-between md:flex-row">
        <div className="text-md flex flex-col items-center justify-center p-4 text-foreground">
          <h4 className="text-xl font-bold">
            Looking for something we don&apos;t have listed?
          </h4>
          <div className="p-2 text-xl"></div>
          <p>Feel free to call or email us at:</p>
          <p>
            Mobile:{" "}
            <a className="text-primary hover:underline" href="tel:0431133764">
              0431 133 764
            </a>
          </p>
          <p>
            Email:{" "}
            <a
              className="text-primary hover:underline"
              href="mailto:contact@partedeuro.com.au"
            >
              contact@partedeuro.com.au
            </a>
          </p>
        </div>
        <div className="text-md flex w-full flex-col p-4 text-foreground md:w-[50%]">
          <p className="p-1">
            All products listed are available for pickup, as well as road
            freight Australia-wide (with very few products exempt from freight).
          </p>
          <p className="p-1">
            Pickup is available from our Knoxfield warehouse, located just 5
            minutes from Knox O-Zone and the Eastlink Freeway.
          </p>
          <p className="p-1 font-bold">
            Our Knoxfield warehouse is open via appointment only. Please contact
            us directly to organise a time to schedule a pickup.
          </p>
        </div>
      </div>
      <div className="flex justify-between gap-4">
        <Link target="_blank" href="https://www.facebook.com/partedeuro">
          <FaFacebookSquare className="h-8 w-8 text-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
        </Link>
        <Link target="_blank" href="https://www.instagram.com/partedeuro/">
          <FiInstagram className="h-8 w-8 text-foreground transition-colors duration-300 ease-in-out hover:text-primary" />
        </Link>
      </div>
    </footer>
  );
};

export default Footer;
