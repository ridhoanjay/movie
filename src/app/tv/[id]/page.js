"use client";
import Banner from "@/app/components/Banner/banner";
import Footer from "@/app/components/Footer/footer";
import Slider from "@/app/components/Slider/slider";
import Aos from "aos";
import Image from "next/image";
import { parseISO, format } from "date-fns";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import Card from "@/app/components/Card/card";

function TvDetail() {
    const { id } = useParams(); // Ensure id is properly captured from route

    const [bannerData, setBannerData] = useState(null);
    const [bannerTrailer, setBannerTrailer] = useState(null);
    const [castData, setCastData] = useState(null);
    const [searchData, setSearchData] = useState(null);
    const [loading, setLoading] = useState(true); // Add loading state for user experience

    const searchParams = useSearchParams();
    const query = searchParams.get("query");

    /* initiate AOS */
    useEffect(() => {
        Aos.init({
            duration: 1200,
            once: true,
            offset: 0,
        });

        const fetchData = async () => {
            try {
                setLoading(true); // Set loading to true before fetching data

                /* TMDb Public API Url */
                const apiUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
                /* TMDb API Key */
                const secretKey = process.env.NEXT_PUBLIC_SECRET_KEY;

                /* request header */
                const options = {
                    method: "GET",
                    headers: {
                        accept: "application/json",
                        Authorization: `Bearer ${secretKey}`,
                    },
                };

                /* Fetch banner data */
                const reqBannerData = await fetch(`${apiUrl}/tv/${id}?language=en-US`, options);
                const resBannerData = await reqBannerData.json();
                setBannerData(resBannerData);

                /* Fetch trailer youtube id */
                const reqTrailer = await fetch(`${apiUrl}/tv/${id}/videos?language=en-US`, options);
                const resTrailer = await reqTrailer.json();
                const trailerId = resTrailer.results.length > 0 ? resTrailer.results[resTrailer.results.length - 1].key : null;
                setBannerTrailer(trailerId);

                /* Fetch cast */
                const reqCastData = await fetch(`${apiUrl}/tv/${id}/credits?language=en-US`, options);
                const resCastData = await reqCastData.json();
                setCastData(resCastData.cast);

                /* Fetch search results */
                if (query) {
                    const reqSearch = await fetch(`${apiUrl}/search/multi?query=${query}&include_adult=false&language=en-US&page=1`, options);
                    const resSearch = await reqSearch.json();
                    setSearchData(resSearch.results);
                }

            } catch (error) {
                console.error("Error fetching data:", error); // Handle errors in fetching data
            } finally {
                setLoading(false); // Always set loading to false after fetch is done
            }
        };

        fetchData();
    }, [query, id]);

    if (loading) {
        return <p>Loading...</p>; // Simple loading indicator while data is being fetched
    }

    return (
        <>
            {query ? (
                <div className="">
                    {searchData && searchData.length > 0 ? (
                        <div className="mt-6 px-6 md:px-10 lg:px-20">
                            <h1 className="text-lg md:text-xl lg:text-2xl">Results For: {query}</h1>

                            <div className="mt-6 grid grid-cols-2 md:grid-cols-4 xl:grid-cols-6 gap-6">
                                {searchData.map((data, index) => (
                                    <div key={index} data-aos="fade-up">
                                        <Card data={data} type={data.media_type} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <p>No results found for: {query}</p>
                    )}
                </div>
            ) : (
                <div className="">
                    {bannerData && castData && (
                        <div className="mb-24 lg:mb-10">
                            <Banner data={bannerData} trailerId={bannerTrailer} type={"tv"} />

                            {/* Overview */}
                            <div className="mt-20 md:mt-24 px-6 md:px-10 lg:px-20 overflow-y-hidden" data-aos="fade-up">
                                <h1 className="text-xl lg:text-2xl text-center text-cyan-400 font-medium tracking-wide">Overview</h1>

                                <div className="mt-10 flex gap-16">
                                    <Image
                                        src={bannerData.poster_path ? `https://image.tmdb.org/t/p/w370_and_h556_bestv2${bannerData.poster_path}` : "/img/default-poster.png"}
                                        alt={bannerData.name || "TV Show Poster"}
                                        width={350}
                                        height={340}
                                        unoptimized
                                        className="w-[250px] xl:w-[350px] h-max hidden md:block"
                                    />

                                    <div className="">
                                        {/* Details */}
                                        <table>
                                            <tbody>
                                                <tr>
                                                    <td className="align-top">First Aired</td>
                                                    <td className="pl-20">{format(parseISO(bannerData.first_air_date), "dd MMMM y")}</td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Last Aired</td>
                                                    <td className="pl-20">{format(parseISO(bannerData.last_air_date), "dd MMMM y")}</td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Creator</td>
                                                    <td className="pl-20">
                                                        <div className="flex flex-wrap gap-2">
                                                            {bannerData.created_by.map((data, index) => (
                                                                <p key={index} className="leading-none">
                                                                    {data.name}
                                                                    {bannerData.created_by.length - 1 === index ? "" : ","}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Genre</td>
                                                    <td className="pl-20">
                                                        <div className="flex flex-wrap gap-2">
                                                            {bannerData.genres.map((data, index) => (
                                                                <p key={index} className="leading-none">
                                                                    {data.name}
                                                                    {bannerData.genres.length - 1 === index ? "" : ","}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Seasons</td>
                                                    <td className="pl-20">{bannerData.number_of_seasons}</td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Episodes</td>
                                                    <td className="pl-20">{bannerData.number_of_episodes}</td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Status</td>
                                                    <td className="pl-20">{bannerData.status}</td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Language</td>
                                                    <td className="pl-20">
                                                        <div className="flex flex-wrap gap-2">
                                                            {bannerData.spoken_languages.map((data, index) => (
                                                                <p key={index} className="leading-none">
                                                                    {data.name}
                                                                    {bannerData.spoken_languages.length - 1 === index ? "" : ","}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                                <tr>
                                                    <td className="align-top">Network</td>
                                                    <td className="pl-20">
                                                        <div className="flex flex-wrap gap-2">
                                                            {bannerData.networks.map((data, index) => (
                                                                <p key={index} className="leading-none">
                                                                    {data.name}
                                                                    {bannerData.networks.length - 1 === index ? "" : ","}
                                                                </p>
                                                            ))}
                                                        </div>
                                                    </td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            {/* Cast */}
                            <div className="mt-6 md:mt-10 px-6 md:px-10 lg:px-20 overflow-y-hidden">
                                <Slider data={castData} type={"cast"} title={"Cast"} url={"movie/all"} hideLink={true} />
                            </div>

                            {/* Footer */}
                            <div className="mt-20 px-6 md:px-10 lg:px-20">
                                <Footer />
                            </div>
                        </div>
                    )}
                </div>
            )}
        </>
    );
}

export default TvDetail;
