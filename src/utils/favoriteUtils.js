import { addFavorite, removeFavorite, getUserFavorites } from "../api/favoriteApi";
import { toast } from "react-toastify";

// Додає/видаляє favorite для апартаменту
export async function toggleApartmentFavorite({ user, favorites, setFavorites, apartmentId, setFavoriteApartments }) {
  if (!user?.id) {
    toast.info("Log in to add to favorites!");
    return;
  }

  try {
    const favorite = favorites.find(f => f.apartment && f.apartment.id === apartmentId);
    if (favorite) {
      await removeFavorite(favorite.id);
      toast("Removed from favorites.");
    } else {
      await addFavorite({ userId: user.id, apartmentId });
      toast.success("Added to favorites!");
    }

    const updated = await getUserFavorites();
    setFavorites(updated);
    setFavoriteApartments && setFavoriteApartments(updated.map(f => f.apartmentId));
  } catch (err) {
    console.error("Error toggling apartment favorite:", err);
    toast.error("Something went wrong while updating favorites. Please try again.");
  }
}

// Додає/видаляє favorite для готелю
export async function toggleHotelFavorite({ user, favorites, setFavorites, hotel, apartments, setFavoriteApartments }) {
  if (!user?.id) {
    toast.info("Log in to add to favorites!");
    return;
  }

  try {
    const hotelApts = (apartments || []).filter(a => a.establishment?.id === hotel.id);
    let apt = null;

    if (hotel?.minApartmentPrice != null) {
      apt = hotelApts.find(a => Number(a.price) === Number(hotel.minApartmentPrice)) || null;
    }
    if (!apt) apt = hotelApts[0];

    if (!apt) {
      toast.warn("No available rooms in this hotel!");
      return;
    }

    await toggleApartmentFavorite({
      user, favorites, setFavorites, apartmentId: apt.id, setFavoriteApartments
    });
  } catch (err) {
    console.error("Error toggling hotel favorite:", err);
    toast.error("Something went wrong while updating hotel favorites. Please try again.");
  }
}
