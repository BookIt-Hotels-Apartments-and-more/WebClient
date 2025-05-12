import { useParams } from 'react-router-dom';

const HotelDetails = () => {
  const { id } = useParams();
  return <div className="p-4">🏨 Hotel Details for ID: {id}</div>;
};

export default HotelDetails;
