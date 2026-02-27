import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast } from "react-hot-toast";
import { useUser } from "@context/UserContext";

import {
  Stepper,
  StepperContent,
  StepperIndicator,
  StepperItem,
  StepperNav,
  StepperPanel,
  StepperSeparator,
  StepperTrigger,
} from "@/components/ui/stepper";

import { EggFriedIcon } from "lucide-react";

import { User } from "@masterchef/shared/types/user";
import CustomizeStep1 from "./CustomizeStep1";
import CustomizeStep2 from "./CustomizeStep2";

interface CustomizeProps {
  ready: boolean;
}

export default function Customize({ ready }: CustomizeProps) {
  const navigate = useNavigate();
  const { user: contextUser, setUser } = useUser();

  const [headerTransitioned, setHeaderTransitioned] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [step1Data, setStep1Data] = useState({
    dietaryRestrictions: [] as string[],
    allergies: [] as string[],
    skillLevel: "",
    favoriteCuisines: [] as string[],
  });
  const [step2Data, setStep2Data] = useState({
    age: 0,
    dateOfBirth: "",
    weight: 0,
    height: 0,
    profilePicture: null as string | null,
    bio: "",
  });

  useEffect(() => {
    if (ready) {
      setTimeout(() => {
        setHeaderTransitioned(true);
      }, 600);
    }
  }, [ready]);

  const CustomizeRootElement = useRef<HTMLDivElement>(null);

  const scrollFormToTop = () => {
    if (CustomizeRootElement.current) {
      CustomizeRootElement.current.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleStep1Next = (data: typeof step1Data) => {
    if (data.favoriteCuisines.length === 0) {
      toast.error("Please select at least one favorite cuisine");
      return;
    }

    const step1DataPartial = data;

    setStep1Data(step1DataPartial);
    setIsTransitioning(true);
    // console.log("new set step 1 obj: ", data)
    scrollFormToTop();

    setTimeout(() => {
      setCurrentStep(1);
      setIsTransitioning(false);
    }, 400);
  };

  const handleStep2Back = () => {
    setIsTransitioning(true);
    scrollFormToTop();

    setTimeout(() => {
      setCurrentStep(0);
      setIsTransitioning(false);
    }, 400);
  };

  const handleStep2Complete = async (data: typeof step2Data) => {
    const loadingToast = toast.loading("Setting up your profile...");
    scrollFormToTop();

    setStep2Data(data);
    const resolvedUserId = contextUser?.id;

    if (!resolvedUserId) {
      toast.dismiss(loadingToast);
      toast.error("Session not found. Please log in again.");
      return;
    }

    const profilePayload = {
      userId: resolvedUserId,
      dietary_restric: step1Data.dietaryRestrictions,
      allergies: step1Data.allergies,
      skill_level: step1Data.skillLevel || undefined,
      cuisines_pref: step1Data.favoriteCuisines,
      pfp: data.profilePicture ?? undefined,
      age: data.age,
      birth: data.dateOfBirth || undefined,
      weight: data.weight || undefined,
      height: data.height || undefined,
      bio: data.bio || undefined,
      isCustomized: true,
    };

    try {
      const BASE_API_URL = import.meta.env.VITE_BASE_API_URL;
      const res = await axios.put(
        `${BASE_API_URL}/auth/profile`,
        profilePayload,
        { withCredentials: true },
      );
      const updatedUser = res.data.user;

      setUser(updatedUser);

      toast.dismiss(loadingToast);
      toast.success("Profile customization complete!\nLet's start cooking!");
      navigate("/dashboard");
    } catch (err: unknown) {
      toast.dismiss(loadingToast);

      if (axios.isAxiosError(err)) {
        const message =
          err?.response?.data?.message ||
          "Failed to save profile. Please try again.";
        toast.error(message);
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    }
  };

  return (
    <div
      ref={CustomizeRootElement}
      className="customize-root w-full h-full p-10 pl-50 max-md:p-0 max-md:pb-5 max-md:m-0 flex flex-col overflow-y-scroll overflow-x-hidden max-md:scroll-m-5 noScrollbar md:showScrollbar"
    >
      <div
        className={`customize-stepper max-md:w-full max-md:h-20 max-md:p-5 relative flex items-center justify-center transition-all duration-500 delay-500 ease-out mb-5 ${headerTransitioned ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
      >
        <Stepper
          defaultValue={currentStep}
          className="pointer-events-none transition-all duration-1000"
        >
          <StepperNav className="transition-all duration-1000">
            {["Culinary Preferences", "Personal Details"].map((step, index) => (
              <StepperItem
                key={step}
                step={index + 1}
                className="transition-all duration-1000"
                data-state={
                  currentStep > index
                    ? "completed"
                    : currentStep === index
                      ? "active"
                      : "inactive"
                }
              >
                <StepperTrigger className="cursor-default transition-all duration-500">
                  <StepperIndicator>{index + 1}</StepperIndicator>
                </StepperTrigger>
                {index <
                  ["Culinary Preferences", "Personal Details"].length - 1 && (
                  <StepperSeparator className="group-data-[state=completed]/step:bg-primary" />
                )}
              </StepperItem>
            ))}
          </StepperNav>

          <StepperPanel className="text-sm transition-all duration-500">
            {["Culinary Preferences", "Personal Details"].map((step, index) => (
              <StepperContent
                key={step}
                value={index}
                className="flex items-center justify-center"
              >
                {step}
              </StepperContent>
            ))}
          </StepperPanel>
        </Stepper>
      </div>

      <div
        className={`transition-all duration-700 ease-out-cubic ${
          headerTransitioned
            ? "text-left mb-8 max-md:mb-12"
            : "text-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        }`}
      >
        <div
          className={`typewriter typewriter-no-animate ${headerTransitioned ? "typewriter-hide-cursor" : ""} max-md:whitespace-normal mb-4 w-full transition-all duration-500 relative`}
        >
          <h1
            className={`text-4xl max-md:text-3xl max-md:text-center font-bold text-foreground w-full transition-all duration-500`}
          >
            {currentStep === 0
              ? "Customize Your Culinary Experience"
              : "Tell Us About Yourself"}
          </h1>
          <EggFriedIcon
            size={70}
            className={`absolute -right-10 -bottom-25 max-md:opacity-10 max-md:z-100 opacity-0 -translate-y-5 transition-all duration-500 delay-700 ease-out ${headerTransitioned ? "opacity-70 translate-y-0" : ""}`}
            color="#FDB813"
          />
        </div>
        <p
          className={`text-muted-foreground transition-all duration-400 max-md:text-center ${ready ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-5"}`}
        >
          {currentStep === 0
            ? "Personalize your cooking journey"
            : "Complete your profile setup"}
        </p>
      </div>

      <div
        className={`transition-all duration-400 ease-out ${
          isTransitioning
            ? "opacity-0 -translate-y-10"
            : "opacity-100 translate-y-0"
        }`}
      >
        {currentStep === 0 && (
          <CustomizeStep1
            onNext={handleStep1Next}
            initialData={step1Data}
            headerTransitioned={headerTransitioned}
          />
        )}
        {currentStep === 1 && (
          <CustomizeStep2
            onNext={handleStep2Complete}
            onBack={handleStep2Back}
            initialData={step2Data}
            headerTransitioned={headerTransitioned}
          />
        )}
      </div>
    </div>
  );
}
