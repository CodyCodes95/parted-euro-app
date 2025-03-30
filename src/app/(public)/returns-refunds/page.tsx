import { Alert, AlertDescription } from "~/components/ui/alert";
import { Separator } from "~/components/ui/separator";
import { AlertTriangle } from "lucide-react";

export default function ReturnsRefunds() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted">
      <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Warranty & Return Policy
          </h1>
          <p className="mt-4 text-lg text-muted-foreground">
            Please review our warranty and return policy carefully
          </p>
        </div>

        <div className="mt-12 space-y-8">
          {/* Important Notices */}
          <div className="space-y-4">
            <p className="text-lg text-foreground">
              All items sold by Parted Euro for their listed price do not
              include any forms of warranty or insurance.
            </p>

            <p className="text-lg text-foreground">
              Parted Euro offers a 30 day warranty for any requested item, at an
              additional 20% to be added to the cost.
            </p>

            <p className="text-sm italic text-muted-foreground">
              For example; if an item is $300, warranty can be requested -
              bringing the total cost to $360 inclusive of warranty.
            </p>
          </div>

          <Separator />

          {/* Time Limit Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <span className="font-semibold">
                Strictly no returns will be accepted after 30 days from the
                dated invoice.
              </span>{" "}
              If your item was shipped to you, we will go off the delivery date
              from the shipment tracking.
            </AlertDescription>
          </Alert>

          {/* Exclusions */}
          <div className="space-y-4">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Any USED item that is related to Brakes, Hydraulics or
                Electronics are EXCLUDED from all warranties.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 text-muted-foreground">
              <p>
                We view Brakes and Hydraulics as a safety item. Due to these
                being used parts, we cannot foresee the durability and
                reliability of these products, and therefore cannot guarantee
                their lasting performance. All used items that fit these
                categories will have a detailed description of their condition.
                Buyer agrees to these terms by purchasing any brake and
                hydraulic related item.
              </p>
              <p>
                Electronic components can potentially appear faulty, or be
                damaged upon install due to other external sources interfering.
                For this reason, we cannot offer warranty on any electrical
                products. Buyer agrees to these terms by purchasing any
                electronic related item.
              </p>
            </div>
          </div>

          <Separator />

          {/* Warranty Returns */}
          <div className="space-y-4">
            <p className="text-foreground">
              If an item is returned under warranty within the 30 day period, we
              will aim to source you a replacement, free of charge. If we cannot
              find a suitable replacement, a 20% restocking fee will incur.
            </p>
            <p className="italic text-muted-foreground">
              For example, if an item was $360 inclusive of warranty, your
              returned amount will be $300 (the total sum of the parts value).
            </p>
          </div>

          <Separator />

          {/* Warranty Terms */}
          <div className="space-y-8">
            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Parted Euro will warrant/return an item if the following terms
                are met:
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  The part(s) purchased has outstanding physical damage which
                  was not mentioned in the listing.
                </li>
                <li>
                  The part(s) supplied are not as described, or does not suit
                  the part number/VIN we have listed.
                </li>
              </ul>
            </div>

            <div>
              <h2 className="mb-4 text-xl font-semibold text-foreground">
                Parted Euro will REFUSE a warranty/return on an item if:
              </h2>
              <ul className="list-disc space-y-2 pl-5 text-muted-foreground">
                <li>
                  The part(s) have been opened, modified or tampered with.
                </li>
                <li>
                  The part(s) show signs of incorrect installation, or have been
                  damaged in an attempt to install them.
                </li>
                <li>The part(s) have malfunctioned due to carelessness.</li>
                <li>
                  The part(s) have been painted, sanded, primed or altered in
                  any way.
                </li>
              </ul>
            </div>
          </div>

          {/* Freight Notice */}
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Parted Euro takes ZERO RESPONSIBILITY for loss or damage of parts
              through freight. It is strongly suggested that freighted parts are
              insured. Please contact us if you would like to take insurance on
              freight of any item sent.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    </div>
  );
}
