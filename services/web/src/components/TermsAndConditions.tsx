// services/web/src/components/TermsAndConditions.tsx
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";
import { ScrollArea } from "./ui/scroll-area";
import { Button } from "./ui/button";

export function TermsAndConditions({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-2xl bg-brand-cream border-brand-orange border-2">
        <DialogHeader>
          <DialogTitle className="text-2xl text-brand-burgundy">
            Terms of Service & Privacy Policy
          </DialogTitle>
          <DialogDescription className="text-brand-orange">
            Last updated: November 4, 2025. Please read these terms carefully.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="space-y-6 text-brand-burgundy">
            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-burgundy">
                1. Acceptance of Terms
              </h3>
              <p className="text-sm">
                By creating an account and using the Spot2Go platform
                ("Service"), you are agreeing to be bound by these Terms of
                Service and our Privacy Policy. If you do not agree to these
                terms, please do not use the Service.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-burgundy">
                2. Our Service ("What We Are")
              </h3>
              <p className="text-sm">
                Spot2Go ("we," "us") provides a technology platform that
                connects users ("Customers") seeking to book study or work
                spaces with businesses ("Owners") who offer such spaces for
                reservation. We are a neutral third-party facilitator and are
                not responsible for the quality, safety, or legality of the
                spaces listed.
              </p>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-burgundy">
                3. Privacy Policy ("What Data We Collect")
              </h3>
              <p className="text-sm">
                We take your privacy seriously. We collect information to provide
                and improve our Service.
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                <li>
                  <strong>Personal Information:</strong> When you sign up, we
                  collect your name, email address, and (if provided) phone
                  number. Your password is one-way encrypted and cannot be seen
                  by us.
                </li>
                <li>
                  <strong>Owner Information:</strong> If you register as an
                  Owner, we collect your business name, place details (address,
                  amenities, images), and contact information.
                </li>
                <li>
                  <strong>Booking Information:</strong> We store a history of
                  your bookings, including date, time, and location, to provide
                  our service and for you to review in your account.
                </li>
                <li>
                  <strong>Location Data:</strong> With your explicit permission,
                  we may collect your device's precise location (latitude and
                  longitude) to find and display spots near you. This data is not
                  stored long-term and is only used for the "nearby" search
                  feature.
                </li>
                <li>
                  <strong>Reviews & Bookmarks:</strong> We store any reviews you
                  submit and a list of your bookmarked places.
                </li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-burgundy">
                4. How We Use Your Data
              </h3>
              <p className="text-sm">
                Your data is used to:
              </p>
              <ul className="list-disc list-inside space-y-1 text-sm pl-4">
                <li>Create and manage your account.</li>
                <li>Process your bookings and send confirmations.</li>
                <li>
                  Notify Owners of new bookings, including your name, email,
                  and phone number for check-in and contact purposes.
                </li>
                <li>Send you service-related notifications (e.g., password
                  resets, booking alerts).</li>
                <li>Calculate and display real-time distances to spots.</li>
              </ul>
            </section>

            <section className="space-y-2">
              <h3 className="text-lg font-semibold text-brand-burgundy">
                5. Account Termination & Data Deletion
              </h3>
              <p className="text-sm">
                You have the right to delete your account at any time. You can
                request account deletion through your "Account Settings" page.
              </p>
              <p className="text-sm">
                Upon receiving a deletion request, we will permanently delete
                your personal information (name, email, phone number) from our
                production databases. Anonymized booking or review data (e.g.,
                "a user booked this spot in March") may be retained for
                statistical purposes, but it will no longer be linked to you.
              </p>
            </section>
          </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button className="bg-brand-orange text-brand-cream hover:bg-brand-orange/90">
              Close
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}