import { ROOT_URL } from "@/data/const";

type GalleryResponse = {
  status?: string;
  data?: unknown[];
};

const getGallery = async (): Promise<GalleryResponse> => {
  const url = `${ROOT_URL}/gallery/get.php`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 60 },
      headers: {
        Accept: "application/json",
        "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
      },
    });

    if (!response.ok) {
      throw new Error(`Gallery API returned ${response.status}`);
    }

    return (await response.json()) as GalleryResponse;
  } catch (error) {
    console.error("Unable to load the legacy gallery during build.", error);
    return { status: "empty", data: [] };
  }
};

export default getGallery;
