export interface User {
  id: string;
  email: string;
  name: string;
  pfp?: string; //either url format or b64
  age: number;
  birth?: string | number; //idk yet..
  weight?: number;
  height?: number;
  bio?: string;
  dietary_restric?: string[];
  allergies?: string[];
  skill_level?: "beginner" | "intermediate" | "advanced" | "expert";
  cuisines_pref: string[]; //ex: indian, mexican, ect
  createdAt?: Date;
  updatedAt?: Date;
}

export interface UserCredentials {
  email: string;
  password: string;
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
}
