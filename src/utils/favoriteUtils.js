import { addFavorite, removeFavorite, getUserFavorites } from "../api/favoriteApi";
import { toast } from "react-toastify";

// Додає/видаляє favorite для кімнати
export async function toggleApartmentFavorite({ user, favorites, setFavorites, apartmentId, setFavoriteApartments }) {
  if (!user?.id) {
    toast.info("Log in to add to favorites!");
    return;
  }
  const favorite = favorites.find(f => f.apartment && f.apartment.id === apartmentId);
  if (favorite) {
    await removeFavorite(favorite.id);
    toast("Removed from favorites.");
  } else {
    await addFavorite({ userId: user.id, apartmentId });
    toast.success("Added to favorites!");
  }
  const updated = await getUserFavorites(user.id);
  setFavorites(updated);
  setFavoriteApartments && setFavoriteApartments(updated.map(f => f.apartmentId));
}

// Додає/видаляє favorite для готелю (за apartmentId першої/найдешевшої кімнати)
export async function toggleHotelFavorite({ user, favorites, setFavorites, hotel, apartments, setFavoriteApartments }) {
  if (!user?.id) {
    toast.info("Log in to add to favorites!");
    return;
  }
  // Знаходимо apartmentId готелю (наприклад, з найменшою ціною)
  const apt = (apartments || []).filter(a => a.establishment?.id === hotel.id)
    .sort((a, b) => (a.price || 999999) - (b.price || 999999))[0];
  if (!apt) {
    toast.warn("No available rooms in this hotel!");
    return;
  }
  await toggleApartmentFavorite({
    user, favorites, setFavorites, apartmentId: apt.id, setFavoriteApartments
  });
}
