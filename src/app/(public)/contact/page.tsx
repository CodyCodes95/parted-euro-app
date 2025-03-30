"use client";

import { useState } from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Separator } from "~/components/ui/separator";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement form submission logic
    console.log("Form submitted:", formData);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Contact Us
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            We&apos;re here to help with any questions about our parts or
            services
          </p>
        </div>

        <div className="mt-12 flex items-center justify-center">
          {/* <div className="mt-12 grid gap-8 lg:grid-cols-2"> */}
          {/* Contact Information */}
          <Card>
            <CardHeader>
              <CardTitle>Get in Touch</CardTitle>
              <p className="mt-4 text-muted-foreground">
                Have questions about our parts or services? We&apos;re here to
                help!
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
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
                    <a
                      className="text-muted-foreground"
                      href="tel:+61431133764"
                    >
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

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg font-medium text-foreground">
                  Business Hours
                </h3>
                <p className="text-muted-foreground">(Via appointment only)</p>
                <div className="mt-4 space-y-2 text-muted-foreground">
                  <p>Monday to Friday</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Form */}
          {/* <Card>
            <CardContent className="pt-6">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input
                    type="text"
                    name="name"
                    id="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    type="email"
                    name="email"
                    id="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="subject">Subject</Label>
                  <Input
                    type="text"
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message</Label>
                  <textarea
                    name="message"
                    id="message"
                    rows={4}
                    value={formData.message}
                    onChange={handleChange}
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    required
                  />
                </div>

                <Button type="submit" className="w-full">
                  Send Message
                </Button>
              </form>
            </CardContent>
          </Card> */}
        </div>
      </div>
    </div>
  );
}
