import {
  addFavorite,
  removeFavorite,  
} from "../api/favoriteApi";
import { toast } from "react-toastify";

function readFavsLS() {
  try { return JSON.parse(localStorage.getItem("favorites") || "[]"); }
  catch { return []; }
}

function writeFavsLS(list) {
  localStorage.setItem("favorites", JSON.stringify(Array.isArray(list) ? list : []));
  window.dispatchEvent(new Event("favorites-updated"));
}

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
        const updated = favorites.filter(f => f.id !== existingId);
        setFavorites(updated);
        writeFavsLS(updated);
      } else {

        const created = await addFavorite({ userId: user.id, establishmentId });
        toast.success("Added to favorites!");

        const newFav = typeof created === "object"
          ? created
          : { id: created, establishmentId };
        const updated = [...(favorites || []), newFav];
        setFavorites(updated);
        writeFavsLS(updated);
      }

      if (setFavoriteEstablishments) {

        const updatedLS = readFavsLS();
        setFavoriteEstablishments(
          updatedLS.map((f) => f.establishmentId ?? f.establishment?.id).filter(Boolean)
        );
      }
    } catch (err) {
      console.error("Error toggling hotel favorite:", err);
      toast.error("Something went wrong while updating favorites. Please try again.");
    } 
}



