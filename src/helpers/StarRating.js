import { FaStar, FaStarHalf } from "react-icons/fa";

export default function StarRating({ rating, color, size }) {

    if (rating == '3.5') {
        return (
            <div className="flex w-24">
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStarHalf style={{ color: color }} size={size} />
            </div>
        )
    }

    if (rating == '4') {
        return (
            <div className="flex w-24">
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
            </div>
        )
    }

    if (rating == '4.5') {
        return (
            <div className="flex w-24">
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStarHalf style={{ color: color }} size={size} />
            </div>
        )
    }

    if (rating == '5') {
        return (
            <div className="flex w-24">
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
                <FaStar style={{ color: color }} size={size} />
            </div>
        )
    }

}