"use client";
import { useState, useEffect } from "react";
import { useDataContext } from "@/context/data.context";
import { useParams } from "next/navigation";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { ContentstackClient } from "@/lib/contentstack-client"

// Sample events data for Red Panda Resort
// This array contains 20 resort-appropriate events with title, description, dateTime, location, and optional image
export const resortEvents = [
  {
    title: "Sunrise Yoga on the Beach",
    description: "Start your day with a peaceful yoga session on our pristine white sand beach. Our certified instructor will guide you through gentle poses as the sun rises over the Indian Ocean. All levels welcome. Mats and towels provided.",
    dateTime: "Daily at 6:30 AM",
    location: "Beach Pavilion",
    image: "/images/events/sunrise-yoga.jpg"
  },
  {
    title: "Snorkeling Adventure to Coral Gardens",
    description: "Explore the vibrant underwater world of the Maldives with our guided snorkeling tour. Discover colorful coral reefs teeming with tropical fish, sea turtles, and marine life. Equipment included. Suitable for beginners and experienced snorkelers.",
    dateTime: "Daily at 9:00 AM and 2:00 PM",
    location: "Water Sports Center",
    image: "/images/events/snorkeling.jpg"
  },
  {
    title: "Maldivian Cooking Class",
    description: "Learn to prepare authentic Maldivian dishes with our executive chef. Discover the secrets of local spices and traditional cooking methods. Includes lunch featuring the dishes you prepare. Limited to 12 participants.",
    dateTime: "Tuesdays and Fridays at 11:00 AM",
    location: "Culinary Studio",
    image: "/images/events/cooking-class.jpg"
  },
  {
    title: "Sunset Dolphin Watching Cruise",
    description: "Embark on a magical journey to spot playful dolphins in their natural habitat. Enjoy complimentary champagne and canapés as you watch the sun set over the horizon. This is one of our most popular experiences.",
    dateTime: "Daily at 5:30 PM",
    location: "Main Jetty",
    image: "/images/events/dolphin-cruise.jpg"
  },
  {
    title: "Beachside BBQ Dinner",
    description: "Indulge in a sumptuous beachside barbecue featuring fresh seafood, grilled meats, and local specialties. Enjoy live music and traditional Maldivian entertainment under the stars.",
    dateTime: "Wednesdays and Saturdays at 7:00 PM",
    location: "Beach Restaurant",
    image: "/images/events/beach-bbq.jpg"
  },
  {
    title: "Spa Wellness Workshop",
    description: "Join our wellness expert for a workshop on mindfulness, meditation, and stress relief techniques. Learn practices you can take home with you. Includes a complimentary 30-minute spa treatment.",
    dateTime: "Mondays and Thursdays at 10:00 AM",
    location: "Spa & Wellness Center",
    image: "/images/events/spa-workshop.jpg"
  },
  {
    title: "Stargazing Experience",
    description: "Experience the breathtaking night sky of the Maldives with our astronomy expert. Learn about constellations, planets, and celestial phenomena while enjoying tropical cocktails. Telescopes provided.",
    dateTime: "Fridays at 8:00 PM (weather permitting)",
    location: "Observatory Deck",
    image: "/images/events/stargazing.jpg"
  },
  {
    title: "Stand-Up Paddleboard Yoga",
    description: "Combine the tranquility of yoga with the gentle movement of paddleboarding. This unique class takes place on calm lagoon waters, offering a peaceful and challenging workout.",
    dateTime: "Daily at 7:30 AM",
    location: "Lagoon",
    image: "/images/events/paddleboard-yoga.jpg"
  },
  {
    title: "Traditional Maldivian Bodu Beru Performance",
    description: "Experience the vibrant rhythms and energetic dance of traditional Maldivian Bodu Beru. This cultural performance showcases local music and dance traditions passed down through generations.",
    dateTime: "Sundays and Thursdays at 7:30 PM",
    location: "Main Restaurant",
    image: "/images/events/bodu-beru.jpg"
  },
  {
    title: "Private Island Picnic",
    description: "Escape to a secluded sandbank for a romantic private picnic. Includes gourmet lunch, champagne, and return boat transfer. Perfect for couples celebrating special occasions.",
    dateTime: "Available daily, booking required",
    location: "Private Sandbank",
    image: "/images/events/private-picnic.jpg"
  },
  {
    title: "Manta Ray Snorkeling Expedition",
    description: "Swim alongside majestic manta rays in their natural habitat. Our marine biologist guide will share insights about these gentle giants. Includes boat transfer and equipment. Advanced booking recommended.",
    dateTime: "Mondays, Wednesdays, and Saturdays at 8:00 AM",
    location: "Manta Point (30-minute boat ride)",
    image: "/images/events/manta-ray.jpg"
  },
  {
    title: "Wine Tasting Evening",
    description: "Join our sommelier for an exclusive wine tasting featuring selections from around the world, perfectly paired with artisanal cheeses and charcuterie. Learn about wine regions and tasting notes.",
    dateTime: "Fridays at 6:30 PM",
    location: "Wine Cellar",
    image: "/images/events/wine-tasting.jpg"
  },
  {
    title: "Sunset Fishing Trip",
    description: "Experience traditional Maldivian fishing techniques on our sunset fishing excursion. Catch your dinner and have it prepared by our chefs. All equipment provided. Suitable for all skill levels.",
    dateTime: "Daily at 4:30 PM",
    location: "Fishing Boat",
    image: "/images/events/fishing.jpg"
  },
  {
    title: "Beach Volleyball Tournament",
    description: "Join fellow guests for a friendly beach volleyball tournament. Teams are formed on-site, and all skill levels are welcome. Prizes for winners. Refreshments provided.",
    dateTime: "Sundays at 3:00 PM",
    location: "Beach Volleyball Court",
    image: "/images/events/volleyball.jpg"
  },
  {
    title: "Underwater Photography Workshop",
    description: "Learn to capture stunning underwater images with our professional photographer. Covers equipment, techniques, and composition. Includes a guided snorkeling session to practice your skills.",
    dateTime: "Tuesdays at 10:00 AM",
    location: "Water Sports Center",
    image: "/images/events/underwater-photography.jpg"
  },
  {
    title: "Live Acoustic Music Night",
    description: "Relax with live acoustic music performed by talented local and international artists. Enjoy your favorite cocktails while listening to soothing melodies in our beachfront bar.",
    dateTime: "Daily at 8:00 PM",
    location: "Beach Bar",
    image: "/images/events/live-music.jpg"
  },
  {
    title: "Kids' Marine Discovery Program",
    description: "Educational and fun activities for children to learn about marine life, coral reefs, and ocean conservation. Includes interactive games, crafts, and supervised snorkeling in the lagoon.",
    dateTime: "Daily at 10:00 AM",
    location: "Kids' Club",
    image: "/images/events/kids-marine.jpg"
  },
  {
    title: "Sunrise Kayaking Tour",
    description: "Paddle through calm waters as the sun rises, exploring hidden coves and pristine beaches. Includes light breakfast and refreshments. Single and double kayaks available.",
    dateTime: "Daily at 6:00 AM",
    location: "Water Sports Center",
    image: "/images/events/kayaking.jpg"
  },
  {
    title: "Cocktail Making Class",
    description: "Learn to craft tropical cocktails with our expert mixologist. Discover the art of mixology using local ingredients and traditional techniques. Includes tastings and recipe cards to take home.",
    dateTime: "Wednesdays and Saturdays at 5:00 PM",
    location: "Beach Bar",
    image: "/images/events/cocktail-class.jpg"
  },
  {
    title: "Full Moon Beach Party",
    description: "Celebrate the full moon with a special beach party featuring live DJ, fire dancers, and a themed buffet. Dance under the stars on our pristine beach. Open to all guests.",
    dateTime: "Monthly on full moon (check calendar)",
    location: "Main Beach",
    image: "/images/events/full-moon-party.jpg"
  },
  {
    title: "Reef Conservation Workshop",
    description: "Learn about coral reef ecosystems and participate in our conservation efforts. Includes a presentation by our marine biologist and an opportunity to help with reef restoration activities.",
    dateTime: "Thursdays at 2:00 PM",
    location: "Marine Center",
    image: "/images/events/reef-conservation.jpg"
  }
];

// Helper function to get event days from Contentstack recur array
function getEventDays(recur) {
    if (!recur || !Array.isArray(recur)) {
        return [];
    }
    return recur;
}

// Helper function to format time from Contentstack date field (always GMT+5 Maldives timezone)
function getEventTime(date) {
    if (!date) return '';
    // Parse the date string as UTC and convert to Maldives timezone (GMT+5)
    const dateObj = new Date(date);
    // Format directly in Maldives timezone
    return dateObj.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit',
        hour12: true,
        timeZone: 'Indian/Maldives'
    });
}

// Helper function to format dateTime string for display
function getEventDateTimeString(event) {
    const time = getEventTime(event.date);
    const days = event.recur || [];
    
    if (days.length === 7) {
        return `Daily at ${time}`;
    } else if (days.length === 1) {
        return `${days[0]}s at ${time}`;
    } else if (days.length > 1) {
        const dayNames = days.map(day => day + 's').join(', ');
        return `${dayNames} at ${time}`;
    }
    return time;
}

const DEFAULT_EVENT_IMAGE = "https://images.contentstack.io/v3/assets/bltc991c0dda4197336/bltd14b8a03a4e57aad/6719553776705e041bfbd297/villas.jpeg";

export default function Page(){
    const params = useParams();
    const [viewMode, setViewMode] = useState('list'); // 'list' or 'calendar'
    const [selectedEvent, setSelectedEvent] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [entry, setEntry] = useState({});
    const [events, setEvents] = useState([]); // Will be used once JSON structure is provided
    const [isLoading, setIsLoading] = useState(true);
    const initialData = useDataContext();

    useEffect(() => {
        const fetchData = async () => {
          // Fetch events page content
          const data = await ContentstackClient.getElementByType("events_page", params.locale, null);
          if(data) {
            setEntry(data?.[0] ?? null);
            console.log("Events Page Entry:", data?.[0]);
          } else {
            setEntry(null);
          }

          // Fetch events from Contentstack
          const eventsData = await ContentstackClient.getElementByType("event", params.locale, null);
          if(eventsData) {
            console.log("Events from Contentstack:", eventsData);
            console.log("Events array:", eventsData);
            setEvents(eventsData);
          } else {
            console.log("No events found in Contentstack");
            setEvents([]);
          }
          
          setIsLoading(false);
        }
    
        ContentstackClient.onEntryChange(fetchData);
      }, [params.locale, initialData]);

    const openModal = (event) => {
        setSelectedEvent(event);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedEvent(null);
    };

    // Handle ESC key to close modal and prevent body scroll
    useEffect(() => {
        if (isModalOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = 'unset';
        }

        const handleEscape = (e) => {
            if (e.key === 'Escape' && isModalOpen) {
                closeModal();
            }
        };
        document.addEventListener('keydown', handleEscape);
        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [isModalOpen]);

    // Helper function to get audiences from taxonomies
    const getAudiences = (event) => {
        if (!event.taxonomies || !Array.isArray(event.taxonomies)) {
            return [];
        }
        const audienceTaxonomies = event.taxonomies.filter(
            tax => tax.taxonomy_uid === 'event_audiences'
        );
        return audienceTaxonomies.map(tax => tax.term_uid);
    };

    // Transform Contentstack events to match expected format
    const transformedEvents = events.map(event => ({
        title: event.title,
        description: event.description,
        location: event.location,
        dateTime: getEventDateTimeString(event),
        date: event.date,
        recur: event.recur || [],
        image: event.image?.url || null,
        uid: event.uid,
        audiences: getAudiences(event),
        taxonomies: event.taxonomies || []
    }));

    // Use Contentstack events if available, otherwise fall back to hardcoded
    const displayEvents = transformedEvents.length > 0 ? transformedEvents : resortEvents;

    // Organize events by day for calendar view
    const eventsByDay = {};
    const weekDays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    
    weekDays.forEach(day => {
        eventsByDay[day] = [];
    });

    displayEvents.forEach(event => {
        const days = event.recur && event.recur.length > 0 
            ? event.recur 
            : getEventDays(event.dateTime);
        days.forEach(day => {
            if (eventsByDay[day]) {
                eventsByDay[day].push(event);
            }
        });
    });

    // Sort events by time within each day (chronologically from earliest to latest)
    Object.keys(eventsByDay).forEach(day => {
        eventsByDay[day].sort((a, b) => {
            // Use the date field for accurate time comparison
            const dateA = a.date ? new Date(a.date) : null;
            const dateB = b.date ? new Date(b.date) : null;
            
            if (dateA && dateB) {
                // Compare dates directly for accurate chronological sorting
                return dateA.getTime() - dateB.getTime();
            }
            
            // Fallback to string comparison if dates aren't available
            const timeA = a.date ? getEventTime(a.date) : getEventTime(a.dateTime);
            const timeB = b.date ? getEventTime(b.date) : getEventTime(b.dateTime);
            return timeA.localeCompare(timeB);
        });
    });

    if (isLoading) return;

    return(
        <>
            <Header locale={params.locale} />
            <div className="bg-white py-16 sm:py-24">
                <div className="mx-auto max-w-8xl px-6 lg:px-8">
                    <div className="mx-auto max-w-3xl text-center">
                        <h2 className="font-medium text-3xl text-center tracking-widest text-neutral-700 uppercase">
                            {entry?.headline}
                        </h2>
                        {entry?.details && (
                            <p className="mt-2 font-paragraph font-light text-md whitespace-pre-wrap leading-8 text-neutral-700 italic">
                                {entry?.details}
                            </p>
                        )}
                    </div>

                    {/* View Toggle */}
                    <div className="mx-auto mt-8 max-w-5xl flex justify-center">
                        <div className="inline-flex rounded-lg border border-gray-300 bg-white p-1 shadow-sm">
                            <button
                                onClick={() => setViewMode('list')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    viewMode === 'list'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                    </svg>
                                    List View
                                </div>
                            </button>
                            <button
                                onClick={() => setViewMode('calendar')}
                                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                                    viewMode === 'calendar'
                                        ? 'bg-gray-900 text-white'
                                        : 'text-gray-700 hover:bg-gray-100'
                                }`}
                            >
                                <div className="flex items-center gap-2">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                    </svg>
                                    Calendar View
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* List View */}
                    {viewMode === 'list' && (
                        <div className="mx-auto mt-16 max-w-5xl">
                            <div className="space-y-8">
                                {displayEvents.map((event, index) => (
                                    <article
                                        key={event.uid || index}
                                        className="relative flex flex-col overflow-hidden rounded-lg bg-white shadow-sm ring-1 ring-gray-900/5 hover:shadow-md transition-all duration-300 sm:flex-row"
                                    >
                                        {/* Timeline indicator */}
                                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-linear-to-b from-blue-400 via-cyan-500 to-teal-400 sm:left-0"></div>
                                        
                                        {/* Image section */}
                                        <div className="relative w-full h-48 sm:w-64 sm:h-auto sm:self-stretch sm:shrink-0 overflow-hidden flex items-stretch">
                                            <img 
                                                src={event.image || DEFAULT_EVENT_IMAGE} 
                                                alt={event.title}
                                                className="w-full h-full object-cover object-center"
                                            />
                                        </div>
                                        
                                        {/* Content section */}
                                        <div className="flex flex-1 flex-col p-6 sm:pl-8">
                                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mb-3">
                                                <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                    </svg>
                                                    <span className="font-medium">{event.dateTime}</span>
                                                </div>
                                                
                                                <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                    <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                    </svg>
                                                    <span className="font-medium">{event.location}</span>
                                                </div>

                                                {event.audiences && event.audiences.length > 0 && (
                                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                                        <svg className="w-4 h-4 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                                        </svg>
                                                        <span className="font-medium capitalize">{event.audiences.join(', ')}</span>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <h3 className="text-xl font-paragraph font-semibold leading-7 text-gray-900 mb-3">
                                                {event.title}
                                            </h3>
                                            
                                            <p className="text-sm font-light font-paragraph leading-6 text-neutral-700">
                                                {event.description}
                                            </p>
                                        </div>
                                    </article>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Calendar View */}
                    {viewMode === 'calendar' && (
                        <div className="mx-auto mt-16 max-w-8xl">
                            {/* Day Headers Row */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7 mb-6">
                                {weekDays.map((day) => (
                                    <div key={day} className="flex flex-col">
                                        <div className="text-lg font-semibold text-gray-900 mb-2">
                                            {day}
                                        </div>
                                        <div className="h-1 bg-linear-to-r from-blue-400 to-cyan-500 rounded"></div>
                                    </div>
                                ))}
                            </div>
                            
                            {/* Events Grid */}
                            <div className="grid grid-cols-1 gap-6 lg:grid-cols-7">
                                {weekDays.map((day) => (
                                    <div key={day} className="flex flex-col min-w-0">
                                        <div className="flex flex-col space-y-4">
                                            {eventsByDay[day].length > 0 ? (
                                                eventsByDay[day].map((event, eventIndex) => (
                                                    <div
                                                        key={`${day}-${eventIndex}`}
                                                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow flex flex-col flex-1 min-h-[200px]"
                                                    >
                                                        <div className="text-xs font-medium text-blue-600 mb-2">
                                                            {event.date ? getEventTime(event.date) : getEventTime(event.dateTime)}
                                                        </div>
                                                        <h4 className="text-sm font-semibold text-gray-900 mb-2">
                                                            {event.title}
                                                        </h4>
                                                        <div className="text-xs text-gray-500 mb-1">
                                                            {event.location}
                                                        </div>
                                                        {event.audiences && event.audiences.length > 0 && (
                                                            <div className="text-xs text-gray-500 mb-3 capitalize">
                                                                {event.audiences.join(', ')}
                                                            </div>
                                                        )}
                                                        <button
                                                            onClick={() => openModal(event)}
                                                            className="mt-auto text-left text-xs font-medium text-blue-600 hover:text-blue-800 underline self-start"
                                                        >
                                                            View Details
                                                        </button>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-white rounded-lg border border-gray-200 p-4 min-h-[200px] flex items-center justify-center">
                                                    <div className="text-sm text-gray-400 italic">
                                                        No events scheduled
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Event Details Modal */}
            {isModalOpen && selectedEvent && (
                <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
                    {/* Background overlay */}
                    <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={closeModal}></div>

                    {/* Modal panel */}
                    <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
                        <div className="relative transform overflow-hidden rounded-lg bg-white text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl">
                            {/* Close button */}
                            <button
                                onClick={closeModal}
                                className="absolute right-4 top-4 text-gray-400 hover:text-gray-500 z-10"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>

                            {/* Image */}
                            <div className="relative w-full h-64 bg-linear-to-br from-blue-400 to-cyan-500">
                                <img 
                                    src={selectedEvent.image || DEFAULT_EVENT_IMAGE} 
                                    alt={selectedEvent.title}
                                    className="w-full h-full object-cover"
                                />
                            </div>

                            {/* Content */}
                            <div className="bg-white px-6 py-6 sm:px-8">
                                <h3 className="text-2xl font-paragraph font-semibold text-gray-900 mb-4">
                                    {selectedEvent.title}
                                </h3>

                                <div className="space-y-3 mb-6">
                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        <span className="font-medium">{selectedEvent.dateTime}</span>
                                    </div>

                                    <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                        <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        <span className="font-medium">{selectedEvent.location}</span>
                                    </div>

                                    {selectedEvent.audiences && selectedEvent.audiences.length > 0 && (
                                        <div className="flex items-center gap-x-2 text-sm text-gray-600">
                                            <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                                            </svg>
                                            <span className="font-medium capitalize">{selectedEvent.audiences.join(', ')}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="border-t border-gray-200 pt-6">
                                    <p className="text-sm font-light font-paragraph leading-6 text-neutral-700 whitespace-pre-wrap">
                                        {selectedEvent.description}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </>
    )
}