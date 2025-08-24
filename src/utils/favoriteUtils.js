import {
  addFavorite,
  removeFavorite,
  getUserFavorites,
} from "../api/favoriteApi";
import { toast } from "react-toastify";

/** Перевірка: чи є готель у фаворитах */
export function isHotelFavorite(favorites, establishmentId) {
  return favorites?.some(
    (f) =>
      f.establishmentId === establishmentId ||
      f.establishment?.id === establishmentId
  );
}

/** Знайти id фаворита за готелем (щоб видалити) */
function getFavoriteIdByHotel(favorites, establishmentId) {
  const fav =
    favorites?.find(
      (f) =>
        f.establishmentId === establishmentId ||
        f.establishment?.id === establishmentId
    ) || null;
  return fav?.id;
}

export async function toggleHotelFavorite({
  user,
  favorites,
  setFavorites,
  establishmentId,
  setFavoriteEstablishments,
}) {
  if (!user?.id) {
    toast.info("Log in to add to favorites!");
    return;
  }

  try {
    const existingId = getFavoriteIdByHotel(favorites, establishmentId);

    if (existingId) {
      await removeFavorite(existingId);
      toast("Removed from favorites.");
    } else {
      await addFavorite({ userId: user.id, establishmentId });
      toast.success("Added to favorites!");
    }

    // Перечитуємо власні фаворити з бека
    const updated = await getUserFavorites();
    setFavorites(updated);
    if (setFavoriteEstablishments) {
      setFavoriteEstablishments(
        updated.map((f) => f.establishmentId ?? f.establishment?.id).filter(Boolean)
      );
    }
  } catch (err) {
    console.error("Error toggling hotel favorite:", err);
    toast.error(
      "Something went wrong while updating favorites. Please try again."
    );
  }
}
