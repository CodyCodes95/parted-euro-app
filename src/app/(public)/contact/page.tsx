"use client";

import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { Separator } from "~/components/ui/separator";

export default function Contact() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re here to help with any questions about our parts or
            services
          </p>
        </div>

        <div className="mt-12 rounded-lg bg-card p-8">
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold text-foreground">
                Get in Touch
              </h2>
              <p className="mt-4 text-muted-foreground">
                Have questions about our parts or services? We&apos;re here to
                help!
              </p>
            </div>

            <div className="space-y-6">
              <div className="flex items-center gap-4">
                <MapPin className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Our Location</p>
                  <p className="text-muted-foreground">
                    Unit 2/26 Rushdale Street, Knoxfield, Victoria Australia
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Phone className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Phone</p>
                  <a className="text-muted-foreground" href="tel:+61431133764">
                    0431 133 764
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Mail className="h-6 w-6 text-primary" />
                <div>
                  <p className="font-medium text-foreground">Email</p>
                  <a
                    className="text-muted-foreground"
                    href="mailto:contact@partedeuro.com.au"
                  >
                    contact@partedeuro.com.au
                  </a>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <h3 className="text-lg font-medium text-foreground">
                Business Hours
              </h3>
              <p className="text-muted-foreground">(Via appointment only)</p>
              <div className="mt-4 space-y-2 text-muted-foreground">
                <p>Monday to Friday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
