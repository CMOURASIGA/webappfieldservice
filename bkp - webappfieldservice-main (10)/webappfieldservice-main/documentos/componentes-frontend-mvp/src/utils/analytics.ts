export type PageViewProps = {
    page: string;
    feature: string;
    entity_name: string;
    entity_id: string;
    authenticated: string;
};

export const trackPageView = (props: PageViewProps) => {
    if (process.env.NODE_ENV === "production" && typeof window !== "undefined") {
        // Placeholder for analytics logic (e.g. Google Analytics, Clarity custom events)
        // console.log("Track PageView", props);
    }
};
