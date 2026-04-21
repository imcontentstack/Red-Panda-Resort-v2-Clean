"use client"
import {
  useEffect,
  useState,
} from 'react';
import Datepicker from 'react-tailwindcss-datepicker';
import Footer from '@/components/footer';
import Header from '@/components/header';
import Marquee from '@/components/marquee';
import { ContentstackClient } from '@/lib/contentstack-client';
import { useParams } from 'next/navigation';

const flights =
    {
        ORD: [
            {
                airport: "ORD",
                destination: "MLE",
                deptTime: "7:40 PM",
                deptDate: "",
                arrTime: "7:50 AM",
                price: "$1,044",
                duration: "26h 10m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1aa9b466083f438d/66d36cf9c2de8a7455c03767/AA_sq.svg"
            },
            {
                airport: "ORD",
                destination: "MLE",
                deptTime: "7:40 PM",
                deptDate: "",
                arrTime: "7:50 AM",
                price: "$1,453",
                duration: "26h 10m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1aa9b466083f438d/66d36cf9c2de8a7455c03767/AA_sq.svg"
            },
            {
                airport: "ORD",
                destination: "MLE",
                deptTime: "7:40 PM",
                deptDate: "",
                arrTime: "7:50 AM",
                price: "$1,238",
                duration: "26h 10m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1aa9b466083f438d/66d36cf9c2de8a7455c03767/AA_sq.svg"
            }
        ],
        AMS: [
            {
                airport: "AMS",
                destination: "MLE",
                deptTime: "11:45",
                deptDate: "",
                arrTime: "13:00",
                price: "EUR 1.318",
                duration: "22h15",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltcaf8153fbb0225d9/66d36cf9b6489f29eae6921e/KL_sq.svg"
            },
            {
                airport: "AMS",
                destination: "MLE",
                deptTime: "11:45",
                deptDate: "",
                arrTime: "13:00",
                price: "EUR 1.318",
                duration: "22h15",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltcaf8153fbb0225d9/66d36cf9b6489f29eae6921e/KL_sq.svg"
            },
            {
                airport: "AMS",
                destination: "MLE",
                deptTime: "11:45",
                deptDate: "",
                arrTime: "13:00",
                price: "EUR 1.318",
                duration: "22h15",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltcaf8153fbb0225d9/66d36cf9b6489f29eae6921e/KL_sq.svg"
            }
        ],
        CDG: [
            {
                airport: "CDG",
                destination: "MLE",
                deptTime: "13:45",
                deptDate: "",
                arrTime: "15:20",
                price: "826 EUR",
                duration: "22h35",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltc9682714f481f40a/66d36cf970edf864460441f0/AF_sq.svg"
            },
            {
                airport: "CDG",
                destination: "MLE",
                deptTime: "13:45",
                deptDate: "",
                arrTime: "15:20",
                price: "894 EUR",
                duration: "22h35",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltc9682714f481f40a/66d36cf970edf864460441f0/AF_sq.svg"
            },
            {
                airport: "CDG",
                destination: "MLE",
                deptTime: "13:45",
                deptDate: "",
                arrTime: "15:20",
                price: "826 EUR",
                duration: "22h35",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltc9682714f481f40a/66d36cf970edf864460441f0/AF_sq.svg"
            }
        ],
        LHR: [
            {
                airport: "LHR",
                destination: "MLE",
                deptTime: "10:50",
                deptDate: "",
                arrTime: "08:25",
                price: "£353",
                duration: "17h 35m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltb1c2c07c68cae1b6/66d36cf9063d8defac044804/BA_sq.svg"
            },
            {
                airport: "LHR",
                destination: "MLE",
                deptTime: "14:10",
                deptDate: "",
                arrTime: "07:50",
                price: "£383",
                duration: "13h 40m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltb1c2c07c68cae1b6/66d36cf9063d8defac044804/BA_sq.svg"
            },
            {
                airport: "LHR",
                destination: "MLE",
                deptTime: "10:50",
                deptDate: "",
                arrTime: "08:25",
                price: "£353",
                duration: "17h 35m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/bltb1c2c07c68cae1b6/66d36cf9063d8defac044804/BA_sq.svg"
            }
        ],
        SYD: [
            {
                airport: "SYD",
                destination: "MLE",
                deptTime: "8:10 PM",
                deptDate: "",
                arrTime: "3:00 PM",
                price: "AU$2,037",
                duration: "19h 35m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1cfb529b963d4aa6/66d3738aa671311ec2a5ead0/EK_sq.svg"
            },
            {
                airport: "SYD",
                destination: "MLE",
                deptTime: "7:32 PM",
                deptDate: "",
                arrTime: "3:00 PM",
                price: "AU$2,248",
                duration: "19h 35m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1cfb529b963d4aa6/66d3738aa671311ec2a5ead0/EK_sq.svg"
            },
            {
                airport: "SYD",
                destination: "MLE",
                deptTime: "8:10 PM",
                deptDate: "",
                arrTime: "3:00 PM",
                price: "AU$2,631",
                duration: "19h 35m",
                stops: 1,
                logo: "https://demos-images.contentstack.com/v3/assets/blt7f5210b0ccd136f9/blt1cfb529b963d4aa6/66d3738aa671311ec2a5ead0/EK_sq.svg"
            }
        ]
    }


export default function Page({ }) {
    const [deptDate, setDeptDate] = useState({ startDate: null, endDate: null });
    const [formValid, setFormValid] = useState(false);
    const [deptCode, setDeptCode] = useState();
    const [passengers, setPassengers] = useState(2);
    const [searchResults, setSearchResults] = useState([]);
    const [entry, setEntry] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const params = useParams();


    const getContent = async () => {
        const entry = await ContentstackClient.getElementByTypeWtihRefs(
            "flights",
            params.locale,
            [
                
            ]
        );
        setEntry(entry?.[0]?.[0] ?? {});
        setIsLoading(false);
    };


    useEffect(() => {  
        ContentstackClient.onEntryChange(getContent);
    }, []);
    

    useEffect(() => {
        if (deptCode !== undefined && deptDate.startDate !== null && passengers > 0)
            setFormValid(true);
        else
            setFormValid(false);
    }, [deptDate, deptCode, passengers])

    useEffect(() => {
        console.log('search changed', searchResults)
    }, [searchResults])

    const search = () => {
        let temp = flights[deptCode];
        if (!temp)
            return;
            
        let localeString = "";
        if (deptCode === "ORD")
            localeString = "en-us";
        else if (deptCode === "AMS")
            localeString = "nl-NL";
        else if (deptCode === "CDG")
            localeString = "fr-FR";
        else if (deptCode === "LHR")
            localeString = "en-UK";
        else if (deptCode === "SYD")
            localeString = "en-AU";

        for (let x = 0; x < temp?.length; x++) {
            let dDate = new Date(deptDate.startDate);
            dDate.setDate(dDate.getDate() + x);
            temp[x].deptDate = dDate.toLocaleDateString(localeString);
        }
        setSearchResults(temp);
    }

    if (isLoading) return;

    return (
        <div>
            <Header locale={params.locale} />

            <div className="max-w-8xl mx-auto px-8">

                <img className="w-full" src={entry?.hero_image?.url} />
                <p className="text-center text-3xl mt-10 font-medium">{entry?.headline}</p>

                <div className="max-w-5xl border mx-auto mt-10 p-4 bg-[#F0F9FF] mb-10">
                    <p className={"text-sm " + (entry?.search?.info ? "mb-5" : "")}>{entry?.search?.info}</p>
                    <img className="max-w-96 object-scale-down mx-auto" src={entry?.search?.image?.url} />

                    <div className="grid grid-cols-3 gap-x-6 gap-y-8 ">
                        <div className="">
                            <label htmlFor="first-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Departing Airport
                            </label>
                            <div className="mt-2">
                                <select
                                    className="block w-full px-2 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    onChange={e => setDeptCode(e.target.value)}
                                    defaultValue={"DEFAULT"}
                                >
                                    <option value="DEFAULT" disabled>Select Airport</option>
                                    <option>AMS</option>
                                    <option>CDG</option>
                                    <option>LHR</option>
                                    <option>ORD</option>
                                    <option>SYD</option>
                                </select>
                            </div>
                        </div>

                        <div className="">
                            <label htmlFor="last-name" className="block text-sm font-medium leading-6 text-gray-900">
                                Departure Date
                            </label>
                            <div className="mt-2">
                                <Datepicker
                                    i18n={entry?.locale}
                                    className="block w-full px-2 rounded-md "
                                    asSingle={true}
                                    value={deptDate}
                                    onChange={val => setDeptDate(val)}
                                />
                            </div>
                        </div>

                        <div className="">
                            <label htmlFor="email" className="block text-sm font-medium leading-6 text-gray-900">
                                Passengers
                            </label>
                            <div className="flex">

                                <div className="mt-2">
                                    <input
                                        id="passNum"
                                        name="passNum"
                                        type="number"
                                        min={1}
                                        value={passengers}
                                        onChange={(e) => setPassengers(e.target.value)}
                                        className="block w-full px-2 rounded-md border-0 py-2 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                                    />
                                </div>
                                <button onClick={() => search()} className="bg-[#D71A21] w-1/2 text-white ml-2.5 mt-2 rounded disabled:bg-[#909090]" disabled={!formValid} >SEARCH</button>
                            </div>

                        </div>
                    </div>
                </div>

                <div className="max-w-5xl mx-auto">
                    {searchResults.map((item, index) => (
                        <div key={index} className="border mb-2 flex p-2 items-center">
                            <img className="h-16 w-16" src={item.logo} />
                            <div className="ml-10 w-full">
                                <p>{`${item.deptDate} ${item.airport} -> ${item.destination}`}</p>
                                <div className="w-full grid grid-cols-4">
                                    <div className= "">
                                        <p className="text-sm font-medium">DEPART</p>
                                        <p className="text-3xl">{item.deptTime}</p>
                                    </div>
                                    <div className="ml-10">
                                        <p className="text-sm font-medium">DURATION</p>
                                        <p className="text-3xl">{item.duration}</p>
                                    </div>
                                    <div className="ml-10">
                                        <p className="text-sm font-medium">ARRIVE</p>
                                        <p className="text-3xl">{item.arrTime}</p>
                                    </div>
                                    <div className="ml-10">
                                        <p className="text-sm font-medium">PRICE</p>
                                        <p className="text-3xl text-[#D71A21]">{item.price}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {entry?.modular_blocks?.map((block, index) => {
                    if(block.hasOwnProperty("marquee"))
                        return <Marquee key={index} content={block.marquee} />
                })}
                
            </div>

            <Footer />
        </div>
    )
}