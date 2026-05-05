import { Button } from "@/components/ui/button";

const profileFields = [
  { label: "FULL NAME", value: "John Doe" },
  { label: "EMAIL", value: "john.doe@example.com" },
  { label: "PHONE", value: "+91 98765 43210" },
  { label: "DATE OF BIRTH", value: "—" },
];

const ProfileSection = () => {
  return (
    <>
      <div className="mb-6">
        <h2 className="font-serif text-2xl">Profile</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Manage your personal information
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 max-w-2xl">
        {profileFields.map((f) => (
          <div key={f.label}>
            <label className="text-xs text-muted-foreground tracking-wider mb-1 block">
              {f.label}
            </label>
            <input
              defaultValue={f.value}
              className="w-full bg-secondary border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        ))}
      </div>
      <Button className="mt-6">
        Save Changes
      </Button>
    </>
  );
};

export default ProfileSection;