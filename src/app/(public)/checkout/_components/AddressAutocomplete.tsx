import React, { useEffect } from "react";

import {
  CommandEmpty,
  CommandInput,
  CommandItem,
} from "~/components/ui/command";
import { useCallback, useState } from "react";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import {
  CheckCircle2Icon,
  DeleteIcon,
  Loader2Icon,
  XCircleIcon,
} from "lucide-react";
import { Command, CommandGroup, CommandList } from "~/components/ui/command";
import usePlacesAutocomplete, { getDetails } from "use-places-autocomplete";
import { toast } from "sonner";
import { cn } from "~/lib/utils";

export type CheckoutAddress = {
  formattedAddress: string;
  city: string;
  region: string;
  postalCode: string;
};

interface AddressAutoCompleteProps {
  address: CheckoutAddress;
  setAddress: (address: CheckoutAddress) => void;
  showInlineError?: boolean;
  placeholder?: string;
}

export function AddressAutoComplete(props: AddressAutoCompleteProps) {
  const { address, setAddress, showInlineError = true, placeholder } = props;
  const [selectedPlaceId, setSelectedPlaceId] = useState("");

  const getPlaceDetails = async (placeId: string) => {
    const placeDetails = (await getDetails({
      placeId: placeId,
      fields: ["address_components", "formatted_address"],
    })) as google.maps.places.PlaceResult;
    return placeDetails;
  };

  useEffect(() => {
    if (selectedPlaceId) {
      void getPlaceDetails(selectedPlaceId).then((placeDetails) => {
        const city = placeDetails.address_components?.find((x) =>
          x.types.includes("locality"),
        )?.short_name;
        const postalCode = placeDetails.address_components?.find((x) =>
          x.types.includes("postal_code"),
        )?.short_name;
        const region = placeDetails.address_components?.find((x) =>
          x.types.includes("administrative_area_level_1"),
        )?.short_name;
        const formattedAddress = placeDetails.formatted_address;
        if (!city || !postalCode || !region || !formattedAddress) {
          return toast.error("Unable to find address from selected location");
        }
        setAddress({
          city: city,
          formattedAddress: formattedAddress,
          postalCode: postalCode,
          region: region,
        });
      });
    }
  }, [selectedPlaceId]);

  return (
    <>
      {selectedPlaceId !== "" || address.formattedAddress ? (
        <div className="flex items-center gap-2">
          <Input
            autoComplete="off"
            value={address?.formattedAddress}
            readOnly
          />
          <Button
            type="reset"
            onMouseDown={() => {
              setSelectedPlaceId("");
              setAddress({
                formattedAddress: "",
                city: "",
                region: "",
                postalCode: "",
              });
            }}
            size="icon"
            variant="outline"
            className="shrink-0"
          >
            <DeleteIcon className="size-4" />
          </Button>
        </div>
      ) : (
        <AddressAutoCompleteInput
          selectedPlaceId={selectedPlaceId}
          setSelectedPlaceId={setSelectedPlaceId}
          showInlineError={showInlineError}
          placeholder={placeholder}
        />
      )}
    </>
  );
}

interface CommonProps {
  selectedPlaceId: string;
  setSelectedPlaceId: (placeId: string) => void;
  showInlineError?: boolean;
  placeholder?: string;
}

function AddressAutoCompleteInput(props: CommonProps) {
  const { setSelectedPlaceId, selectedPlaceId, showInlineError, placeholder } =
    props;

  const [isOpen, setIsOpen] = useState(false);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Escape") {
      close();
    }
  };

  const {
    value,
    setValue,
    suggestions: { data: predictions, loading },
  } = usePlacesAutocomplete({
    requestOptions: {
      types: ["(regions)"],
      componentRestrictions: {
        country: "AU",
      },
    },
    debounce: 300,
  });

  return (
    <Command
      shouldFilter={false}
      onKeyDown={handleKeyDown}
      className="overflow-visible"
    >
      <div className="flex w-full items-center justify-between rounded-lg border bg-background text-sm ring-offset-background focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2">
        <CommandInput
          autoComplete="false"
          value={value}
          onValueChange={setValue}
          onBlur={close}
          onFocus={open}
          placeholder={placeholder ?? "Enter suburb or postcode"}
          className="w-full rounded-lg p-3 outline-none"
        />
      </div>
      {value !== "" && !isOpen && !selectedPlaceId && showInlineError && (
        <FormMessages
          type="error"
          className="pt-1 text-sm"
          messages={["Select a valid address from the list"]}
        />
      )}

      {isOpen && (
        <div className="relative h-auto animate-in fade-in-0 zoom-in-95">
          <CommandList>
            <div className="absolute top-1.5 z-50 w-full">
              <CommandGroup className="relative z-50 h-auto min-w-[8rem] overflow-hidden rounded-md border bg-background shadow-md">
                {loading ? (
                  <div className="flex h-28 items-center justify-center">
                    <Loader2Icon className="size-6 animate-spin" />
                  </div>
                ) : (
                  <>
                    {predictions
                      .filter(
                        (prediction) =>
                          !prediction.types.includes("colloquial_area"),
                      )
                      .filter((prediction) =>
                        prediction.types.includes("postal_code"),
                      )
                      // .filter((prediction) =>
                      //   prediction.types.includes("locality"),
                      // )
                      // .filter((prediction) =>
                      //   prediction.types.includes("administrative_area_level_1"),
                      // )
                      .map((prediction) => (
                        <CommandItem
                          value={prediction.place_id}
                          onSelect={() => {
                            setValue("");
                            setSelectedPlaceId(prediction.place_id);
                          }}
                          className="flex h-max cursor-pointer select-text flex-col items-start gap-0.5 rounded-md p-2 px-3 hover:bg-accent hover:text-accent-foreground aria-selected:bg-accent aria-selected:text-accent-foreground"
                          key={prediction.place_id}
                          onMouseDown={(e) => e.preventDefault()}
                        >
                          {prediction.description}
                        </CommandItem>
                      ))}
                  </>
                )}

                <CommandEmpty>
                  {!loading && predictions.length === 0 && (
                    <div className="flex items-center justify-center py-4">
                      {value === ""
                        ? "Please enter an address"
                        : "No address found"}
                    </div>
                  )}
                </CommandEmpty>
              </CommandGroup>
            </div>
          </CommandList>
        </div>
      )}
    </Command>
  );
}

interface FormMessagesProps extends React.HTMLAttributes<HTMLDivElement> {
  messages?: string[] | string | React.ReactNode;
  type?: "error" | "success";
}

export function FormMessages({
  messages,
  type = "error",
  className,
  ...props
}: FormMessagesProps) {
  if (!messages) {
    return null;
  }

  const isReactNode = React.isValidElement(messages);

  if (!isReactNode && typeof messages === "string") {
    messages = [messages];
  }

  return (
    <div
      aria-invalid={type === "error"}
      className={cn(
        "flex flex-col text-sm text-destructive",
        type === "success" && "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {isReactNode
        ? messages
        : (messages as string[]).map((value, i) => (
            <div key={i.toString()} className="flex gap-2">
              {type === "error" ? (
                <XCircleIcon className="relative top-0.5 size-4 shrink-0" />
              ) : (
                <CheckCircle2Icon className="relative top-0.5 size-4 shrink-0" />
              )}
              <p>{value}</p>
            </div>
          ))}
    </div>
  );
}
