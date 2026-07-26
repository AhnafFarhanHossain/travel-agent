const headers = new Headers();
headers.append("Content-Type", "application/json");
headers.append("X-API-KEY", process.env.SERPER_API_KEY as string);

export async function getHotelData({
  hotelName,
  checkInDate,
  checkOutDate,
  budget,
  guests,
}: {
  hotelName: string;
  checkInDate: string;
  checkOutDate: string;
  budget: number;
  guests: number;
}) {
  try {
    const raw = JSON.stringify({
      q: `${hotelName} booking rates ${checkInDate} to ${checkOutDate} under ${budget} ${guests} guests`,
      hl: "en",
      num: 10,
    });

    const requestOptions: RequestInit = {
      method: "POST",
      headers: headers,
      body: raw,
      redirect: "follow",
    };

    const response = await fetch(
      "https://google.serper.dev/search",
      requestOptions,
    );
    const result = await response.json();

    // extract organic results
    const searchResults = result?.organic?.slice(0, 4).map((result: any) => ({
      title: result.title,
      link: result.link,
      snippet: result.snippet,
      siteLinks: result.sitelinks?.map((sitelink: any) => ({
        title: sitelink.title,
        link: sitelink.link,
      })),
    }));

    return {
      hotelName,
      checkInDate,
      checkOutDate,
      budget,
      guests,
      searchResults,
    }
  } catch (error) {
    console.error("Error fetching hotel data:", error);
    throw new Error("Failed to fetch hotel data");
  }
}
