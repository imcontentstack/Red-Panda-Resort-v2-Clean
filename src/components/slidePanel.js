"use client";
import { useState } from "react";
import { XMarkIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { useEntity, useRecommendations } from "@/context/lyticsTracking";
import { useParams } from "next/navigation";
import { Menu, MenuItem, MenuButton, MenuItems } from '@headlessui/react';
import { ChevronDownIcon } from '@heroicons/react/20/solid';
import Link from "next/link";
import JsonView from '@uiw/react-json-view';
import { lightTheme } from '@uiw/react-json-view/light';
import { useSlidePanel } from '@/context/slidePanel.context';

export default function SlidePanel() {
  const { isOpen, closePanel } = useSlidePanel();
  const lyticsProfileData = useEntity();
  const [selectedTab, setSelectedTab] = useState("Summary");
  const recommendations = useRecommendations();
  const params = useParams();

  //function to convert lytics intrests in two to decimal points
  function moveDecimalPoint(num) {
    if (num >= 1) {
      return "100";
    }
    const str = num.toString();
    const decimalIndex = str.indexOf(".");
  
    return str.slice(decimalIndex + 1, decimalIndex + 3);
  }

  if (!lyticsProfileData) {
    return (
      <div
      className={`fixed top-0 right-0 h-screen w-[450px] bg-white transition-transform duration-300 ease-in-out overflow-y-auto z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col shadow-xl bg-white h-full">
          <div className="flex justify-between items-end bg-[#404040] py-1 px-2 flex-shrink-0">
            <div className="p-2 mx-1 flex">
              <img
                className="h-[20px]"
                src="https://images.contentstack.io/v3/assets/blt7359e2a55efae483/blt0b9a8281aeac3ec0/664c27d3c9024c35b5ad593a/CS_logo.png"
              ></img>
              <div className="font-medium text-[15px] text-neutral-100 normal-case mx-2 self-center h-full">
                Contentstack Dev Tools
              </div>
            </div>
            <button
              className="cursor-pointer ms-auto text-white"
              type="button"
              onClick={closePanel}
            >
              <XMarkIcon className="h-8 m-1 p-1" />
            </button>
          </div>

          <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
            <div className="bg-[#f6f5fc] rounded-lg p-6 w-full">
              <LockClosedIcon className="h-10 w-10 text-[#6351e3] mx-auto mb-3" />
              <p className="text-[16px] font-semibold text-gray-800 mb-2">
                Lytics Tag Not Found
              </p>
              <p className="text-[13px] text-gray-500">
                Add <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#6351e3] font-mono text-[12px]">LYTICS_TAG</code> to
                your <code className="bg-gray-100 px-1.5 py-0.5 rounded text-[#6351e3] font-mono text-[12px]">.env</code> file
                to enable user profiling and behavioral tracking.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  let max100 = Math.min(lyticsProfileData?.data?.user?.likely_premier_score, 100);

  const tabs = [
    { name: 'Summary', isVisible: true },
    {
      name: 'All Attributes',
      isVisible: true,
      label: `Attributes (${Object.keys(lyticsProfileData?.data?.user || {}).length})`
    },
    {
      name: 'Customer',
      isVisible: !!lyticsProfileData?.data?.user?.email
    },
    {
      name: 'Content Recommendations',
      label: 'Recommendations',
      isVisible: recommendations?.length > 0
    }
  ];

  const getLabel = (tab) => tab.label || tab.name;
  
  const selectedLabel = getLabel(tabs.find((tab) => tab.name === selectedTab));

  return (
    <div
      className={`fixed top-0 right-0 h-screen w-[450px] bg-white transition-transform duration-300 ease-in-out overflow-y-auto z-50 ${
        isOpen ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      <div className="flex flex-col shadow-xl bg-white h-full">
        <div className="flex justify-between items-end bg-[#404040] py-1 px-2 flex-shrink-0">
          <div className="p-2 mx-1 flex">
            <img
              className="h-[20px]"
              src="https://images.contentstack.io/v3/assets/blt7359e2a55efae483/blt0b9a8281aeac3ec0/664c27d3c9024c35b5ad593a/CS_logo.png"
            ></img>
            <div className="font-medium text-[15px] text-neutral-100 normal-case mx-2 self-center h-full ">
              Contentstack Dev Tools
            </div>
          </div>
          <button
            className="cursor-pointer ms-auto text-white"
            type="button"
            onClick={closePanel}
          >
            <XMarkIcon className="h-8 m-1 p-1" />
          </button>
        </div>

        <div className="flex-1 w-full rounded-b-xl mb-2 bg-white flex flex-col min-h-0">
          <Menu as="div" className="relative inline-block text-center w-full flex-shrink-0">
            <div>
              <MenuButton className="inline-flex justify-center w-full px-4 py-3 text-sm font-semibold border-neutral rounded-b-md shadow-sm text-[#6351e3] bg-white hover:bg-gray-50 font-roboto tracking-wide">
                {selectedLabel}
                <ChevronDownIcon className="w-5 h-5 ml-2 text-[#6351e3]" />
              </MenuButton>
            </div>
          <MenuItems className={"absolute z-10 mt-2 w-full origin-top-right rounded-b-md bg-white shadow-lg border-b-[1px] border-neutral-200 focus:outline-none"}>
            <div className="py-1">
              {tabs
                .filter((tab) => tab.isVisible)
                .map((tab) => (
                  <MenuItem key={tab.name}>
                      <button
                      onClick={() => {
                        setSelectedTab(tab.name);
                      }}
                      className={`w-full text-center px-4 py-3 text-sm font-semibold font-roboto tracking-wide hover:'bg-gray-100 ${
                        selectedTab === tab.name
                          ? 'text-[#6351e3]'
                          : 'text-[#ababab]'
                        }`}
                      >
                    {getLabel(tab)}
                  </button>
              </MenuItem>
            ))}
        </div>
      </MenuItems>
    </Menu>

          <div className="px-2">
            <div className={`${selectedTab === "Summary" ? "" : "hidden"}`}>
              <div className="h-[90%] border-lg pt-1 pb-2 px-4 rounded-md">
                

                <div className="border-b-[1px] border-neutral-200 flex items-center justify-between mx-2 py-2">
                  <div className="text-[14px] font-semibold normal-case mr-12 py-2">
                    Lytics ID
                  </div>
                  <div className="text-[12px] font-medium justify-self-end normal-case">
                    {lyticsProfileData?.data?.user?._id}
                  </div>
                </div>

                {lyticsProfileData?.data?.user?._uid &&
                  <div className="border-b-[1px] border-neutral-200 flex items-center justify-between mx-2 py-2">
                    <div className="text-[14px] font-semibold normal-case mr-8 py-2">
                      Last _UID
                      (Cookie)
                    </div>
                    <div className="text-[12px] font-medium justify-self-end normal-case">
                      {lyticsProfileData?.data?.user?._uid}
                    </div>
                  </div>
                }


                <div className="border-b-[1px] border-neutral-200 flex flex-col justify-between m-2 py-2">
                  <div className="text-[14px] font-semibold normal-case ">
                    Audiences
                  </div>
                  <div className="text-[14px] normal-case flex flex-row flex-wrap justify-center">
                    {lyticsProfileData?.data?.user?.segments?.map(
                      (item, index) => (
                        <div
                          key={index}
                          className="border-[1px] text-[12px]  border-neutral-400 rounded-lg bg-white p-1 m-1 max-w-[80%] truncate"
                        >
                          {item}
                        </div>
                      )
                    )}
                  </div>
                </div>
               {lyticsProfileData?.data?.user?.likely_premier_score && (
                <div className="border-b-[1px] border-neutral-200 flex flex-col justify-between m-2 py-3">
                  <div className="text-[14px] font-semibold normal-case mb-2">
                    Lookalike Models
                  </div>

                  <div className="flex justify-center flex-col">
                      <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                          <div className="mr-4 w-[35%] truncate">Premier Likelihood</div>
                          <div className="mr-2 text-end w-[6%]">{max100}</div>
                          <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                            <div
                              className={`absolute top-0 left-0 bg-gradient-to-r from-[#f6b25e] to-amber-600 rounded-sm h-full  border-r-black`}
                              style={{
                                width:
                                  max100 +
                                  "%",
                              }}
                            ></div>
                          </div>
                        </div>
                  </div>
                </div>
                )}

                <div className="border-b-[1px] border-neutral-200 flex flex-col justify-between m-2 py-3">
                  <div className="text-[14px] font-semibold normal-case mb-2">
                    Behavioral Scores
                  </div>

                  <div className="flex justify-center flex-col">
                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Consistency</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_consistency}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_consistency +
                              "%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Frequency</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_frequency}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_frequency +
                              "%",
                          }}
                        >
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Intensity</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_intensity}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_intensity +
                              "%",
                          }}
                        >
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Maturity</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_maturity}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_maturity + "%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Momentum</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_momentum}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_momentum + "%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Propensity</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_propensity}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_propensity +
                              "%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Quantity</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_quantity}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`"absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width: `${lyticsProfileData?.data?.user?.score_quantity}%`,
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Recency</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_recency}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_recency + "%",
                          }}
                        ></div>
                      </div>
                    </div>

                    <div className="flex flex-row normal-case text-[12px] justify-end my-1">
                      <div className="mr-4 w-[35%]">Volatility</div>
                      <div className="mr-1 w-[6%] text-end">{lyticsProfileData?.data?.user?.score_volatility}</div>
                      <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                        <div
                          className={`absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full`}
                          style={{
                            width:
                              lyticsProfileData?.data?.user?.score_volatility +
                              "%",
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-neutral-200 flex flex-col justify-between m-2 py-2">
                  <div className="text-[14px] font-semibold normal-case my-2">
                    Interests
                  </div>

                  <div className="flex justify-center flex-col">
                    {lyticsProfileData?.data?.user.lytics_content ?
                    Object.keys(lyticsProfileData?.data?.user.lytics_content).map(
                      (item, index) => (
                        <div key={index} className="flex flex-row normal-case text-[12px] justify-end my-1">
                          <div className="mr-4 w-[35%] truncate">{item}</div>
                          <div className="mr-2 text-end w-[6%]">{moveDecimalPoint(lyticsProfileData?.data?.user?.lytics_content[item])}</div>
                          <div className="w-[60%] bg-[#d9d9e1] rounded-md border-[1px] border-neutral-100 relative">
                            <div className="absolute top-0 left-0 bg-gradient-to-r from-[#6351e3] to-[#b247f8] rounded-sm h-full"
                            style={{
                              width:
                                moveDecimalPoint(lyticsProfileData?.data?.user?.lytics_content[item]) +
                                "%",
                            }}>
                            </div>
                          </div>
                        </div>
                      )
                    ) : (
                      <div className="bg-[#f6f5fc] flex flex-col justify-center rounded-lg p-4 items-center">
                        <LockClosedIcon className="h-8 w-8 text-neutral-600" />
                        <div className="text-black text-[14px] font-light normal-case flex justify-center self-center">
                          Browse more content to unlock interests
                          </div>
                    </div>
                    )}
            
                  </div>
                </div>
              </div>
            </div>

            <div className={`${selectedTab === "Customer" ? "" : "hidden"} p-2`}>

               <div className="border-b-[1px] border-neutral-200 p-1">
                <p className="text-[14px] font-semibold mt-2">Membership Status</p>
              </div>

               <div className="flex flex-row normal-case text-[14px] justify-end my-1 mt-5">
                <div className="mr-4 w-[40%] pl-8">Membership Status</div>
                {lyticsProfileData?.data?.user?.user_attributes?.membership_status &&
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.user_attributes?.membership_status}
                </div>
                }
              </div>
              
              <div className="border-b-[1px] border-neutral-200 p-1">
                <p className="text-[14px] font-semibold mt-2">Total Spend</p>
              </div>

               <div className="flex flex-row normal-case text-[14px] justify-end my-1 mt-5">
                <div className="mr-4 w-[40%] pl-8">Total Spend</div>
                {lyticsProfileData?.data?.user?.total_spend &&
                <div className="w-[60%] relative">
                  ${(lyticsProfileData?.data?.user?.total_spend)}
                </div>
                }
              </div>
                      
              <div className="border-b-[1px] border-neutral-200 p-1">
                <p className="text-[14px] font-semibold mt-8">Salesforce</p>
              </div>
              
              <div className="flex flex-row normal-case text-[14px] justify-end my-1 mt-5">
                <div className="mr-4 w-[40%] pl-8">Full Name</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_name}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4 w-[40%] pl-8">Phone Number</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_phone}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4 w-[40%] pl-8">Postal Code</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_postal_code}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4 w-[40%] pl-8">Marketing Opt Out</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_has_opted_out_of_email ? "True" : "False"}
                </div>
              </div>

              <div className="flex flex-row normal-case text-[14px] justify-end my-1 mt-5">
                <div className="mr-4 w-[40%] pl-8">Company</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_company}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4 w-[40%] pl-8">Industry</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_industry}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4 w-[40%] pl-8">Number Of Employees</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.salesforce_lead_number_of_employees}
                </div>
              </div>

              <div className="border-b-[1px] border-neutral-200 p-2">
                <p className="text-[14px] font-semibold mt-8">Bookings</p>
              </div>
              
              <div className="flex flex-row normal-case text-[14px] justify-end my-1 mt-5">
                <div className="mr-4  w-[40%] pl-8">Past 12 months</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.lead_booking_count_12m}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4  w-[40%] pl-8">Nights</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.lead_booking_count_nights}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4  w-[40%] pl-8">Lifetime</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.lead_booking_count_lifetime}
                </div>
              </div>
              <div className="flex flex-row normal-case text-[14px] justify-end my-1">
                <div className="mr-4  w-[40%] pl-8">Lifetime Nights</div>
                <div className="w-[60%] relative">
                  {lyticsProfileData?.data?.user?.lead_booking_count_lifetime_nights}  
                </div>
              </div>

            </div>

            <div className={`${selectedTab === "All Attributes" ? "" : "hidden"} p-4`}>
              <JsonView value={lyticsProfileData?.data?.user} keyName={"user"} style={lightTheme}/>
            </div>

            <div className={`${selectedTab === "Content Recommendations" ? "" : "hidden"} p-4`}>
              <div className="text-[14px] font-semibold normal-case my-2">
                  Recommendations
              </div>
              {recommendations?.length > 0 && (
                <div>
                  {recommendations?.map((rec, index) => (
                    <div id="parent-container" key={index} className="w-full flex flex-col text-[15px]">
                     {rec?.banner_image && (
                      <div className="relative group w-full max-w-md overflow-hidden rounded-lg shadow-lg my-4">
                          <div id="image-container" className="relative">
                            <img className="object-cover w-full h-64" src={rec?.banner_image?.url} alt={rec?.headline} />
                            
                            <div
                              id="title-container"
                              className="absolute top-0 left-0 w-full px-4 py-2 bg-gradient-to-b from-black/70 to-transparent text-white text-xl font-bold"
                            >
                              {rec?.headline}
                            </div>

                            <div
                              id="bottom-container"
                              className="absolute inset-0 bg-white bg-opacity-100 opacity-0 group-hover:opacity-100 transition-opacity duration-300 p-4 flex flex-col justify-center"
                            >
                              <div id="url-tags" className="mb-2">
                                <div id="url-container">
                                  <Link href={rec?.url ? rec?.url : "/"} className="text-blue-500 underline">
                                    {rec?.url}
                                  </Link>
                                </div>
                                <div id="tags">
                                  {}
                                </div>
                              </div>

                              <div id="description-container">
                                <p>{rec?.teaser}</p>
                              </div>
                            </div>
                          </div>
                        </div>
                        )}

                    </div>
                  ))}
                </div>
              )}
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}

