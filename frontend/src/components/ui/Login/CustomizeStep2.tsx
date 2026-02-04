import { useState, useRef } from "react";
import { Input } from "@components/ui/input";
import { Label } from "@components/ui/label";
import { Upload, User as UserIcon } from "lucide-react";

interface CustomizeStep2Props {
  onNext: (data: {
    age: number;
    dateOfBirth: string;
    weight: number;
    height: number;
    profilePicture: string | null;
    bio: string;
  }) => void;
  onBack: () => void;
  initialData?: {
    age?: number;
    dateOfBirth?: string;
    weight?: number;
    height?: number;
    profilePicture?: string | null;
    bio?: string;
  };
  headerTransitioned: boolean;
}

export default function CustomizeStep2({
  onNext,
  onBack,
  initialData,
  headerTransitioned,
}: CustomizeStep2Props) {
  const [age, setAge] = useState(initialData?.age || "");
  const [dateOfBirth, setDateOfBirth] = useState(
    initialData?.dateOfBirth || "",
  );
  const [weight, setWeight] = useState(initialData?.weight || "");
  const [height, setHeight] = useState(initialData?.height || "");
  const [bio, setBio] = useState(initialData?.bio || "");
  const [profilePicture, setProfilePicture] = useState<string | null>(
    initialData?.profilePicture || null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfilePicture(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onNext({
      age: Number(age),
      dateOfBirth,
      weight: Number(weight),
      height: Number(height),
      profilePicture,
      bio,
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className={`transition-all duration-700 ease-out w-full flex flex-col gap-10 max-md:no-scrollbar ${
        headerTransitioned
          ? "opacity-100 translate-y-0"
          : "opacity-0 translate-y-10"
      }`}
    >
      <div className="w-full flex items-center justify-center">
        <div className="relative">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="w-32 h-32 rounded-full bg-secondary/50 border-2 border-border hover:border-primary transition-all cursor-pointer flex items-center justify-center overflow-hidden group"
          >
            {profilePicture ? (
              <img
                src={profilePicture}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground group-hover:text-primary transition-colors">
                <UserIcon size={40} />
                <Upload size={15} />
              </div>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
          <Label className="block text-center text-sm text-muted-foreground mt-2">
            Profile Picture
          </Label>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:grid-cols-1 max-md:gap-10">
        <div className="w-full md:px-5 max-md:px-2">
          <Label
            htmlFor="age"
            className="text-lg mb-4 max-md:text-sm max-md:ml-1 max-md:mb-2 font-bold text-foreground block"
          >
            Age
            <span className="text-destructive ml-1 text-lg">*</span>
          </Label>
          <Input
            id="age"
            name="age"
            type="number"
            placeholder="25"
            required
            value={age}
            onChange={(e) => setAge(e.target.value)}
            className="w-full h-13 rounded-full max-md:rounded-xl bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5"
            min="13"
            max="123"
          />
        </div>

        <div className="w-full md:px-5 max-md:px-2">
          <Label
            htmlFor="dateOfBirth"
            className="text-lg mb-4 max-md:text-sm max-md:ml-1 max-md:mb-2 font-bold text-foreground block"
          >
            Date of Birth
          </Label>
          <Input
            id="dateOfBirth"
            name="dateOfBirth"
            type="date"
            value={dateOfBirth}
            onChange={(e) => setDateOfBirth(e.target.value)}
            className="w-full h-13 rounded-full max-md:rounded-xl bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-md:px-1">
        <div className="w-full md:px-5">
          <Label
            htmlFor="weight"
            className="text-lg mb-4 max-md:text-sm max-md:ml-1 max-md:mb-2 font-bold text-foreground block"
          >
            Weight (kg)
          </Label>
          <Input
            id="weight"
            name="weight"
            type="number"
            placeholder="70"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            className="w-full h-13 rounded-full max-md:rounded-xl bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5"
            min="20"
            max="500"
            step="0.1"
          />
        </div>

        <div className="w-full md:px-5">
          <Label
            htmlFor="height"
            className="text-lg mb-4 max-md:text-sm max-md:ml-1 max-md:mb-2 font-bold text-foreground block"
          >
            Height (cm)
          </Label>
          <Input
            id="height"
            name="height"
            type="number"
            placeholder="175"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            className="w-full h-13 rounded-full max-md:rounded-xl bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5"
            min="50"
            max="300"
          />
        </div>
      </div>

      <div className="w-full md:px-5 max-md:px-2">
        <Label
          htmlFor="bio"
          className="text-lg mb-4 max-md:text-sm max-md:mb-1 font-bold text-foreground block"
        >
          Bio
        </Label>
        <p className="text-sm text-muted-foreground mb-4">
          Tell us a bit about yourself and your cooking journey
        </p>
        <textarea
          id="bio"
          name="bio"
          placeholder="I love experimenting with new recipes and sharing meals with friends..."
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="w-full h-32 max-md:h-60 rounded-2xl bg-input/80 border-border/60 shadow-sm shadow-border/80 px-5 py-3 resize-none focus:outline-none focus:ring-2 focus:ring-ring"
          maxLength={500}
        />
        <p className="text-xs text-muted-foreground mt-1 text-right">
          {bio.length}/500 characters
        </p>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="w-full h-13 bg-secondary/90 text-foreground font-bold rounded-full shadow-sm shadow-border/50 hover:shadow-border/90 hover:opacity-90 cursor-pointer transition-all duration-200"
        >
          Back
        </button>
        <button
          type="submit"
          className="w-full h-13 bg-primary/90 text-accent font-bold rounded-full shadow-sm shadow-primary/50 hover:shadow-primary/90 hover:opacity-90 cursor-pointer transition-all duration-200"
        >
          Complete Setup
        </button>
      </div>
    </form>
  );
}
