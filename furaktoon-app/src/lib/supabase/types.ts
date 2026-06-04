export type Generation = {
  id: string;
  user_id: string;
  prompt: string;
  style: "anime" | "cartoon";
  model: string;
  image_url: string;
  created_at: string;
};
