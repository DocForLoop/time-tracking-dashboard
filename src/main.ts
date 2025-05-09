import './scss/style.scss';

interface Timeframe {
    current: number;
    previous: number;
}

interface Timeframes {
    daily: Timeframe;
    weekly: Timeframe;
    monthly: Timeframe;
}

interface Activity {
    title: string;
    timeframes: Timeframes;
}

const tabs = document.querySelectorAll('.dashboard__tab') as NodeListOf<HTMLButtonElement>;
const cards = document.querySelectorAll('.dashboard__card') as NodeListOf<HTMLElement>;

let activityData: Activity[] = [];

const fetchData = async (): Promise<Activity[]> => {

    try {
        const response = await fetch('/data.json');

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        return await response.json();
    }
    catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
};

const getPreviousPeriodLabel = (timeframe: 'daily' | 'weekly' | 'monthly'): string => {

    switch (timeframe) {
        case 'daily':
            return 'Yesterday';
        case 'weekly':
            return 'Last Week';
        case 'monthly':
            return 'Last Month';
    }
};

const getHoursLabel = (hours: number): string => {
    return `${hours}${hours === 1 || hours === 0 ? 'hr' : 'hrs'}`;
}

const updateCards = (data: Activity[], timeframe: 'daily' | 'weekly' | 'monthly'): void => {

    cards.forEach((card, index) => {
        const {current, previous} = data[index].timeframes[timeframe];

        card.querySelector('.dashboard__card-hrs-current')!.textContent =
            getHoursLabel(current);

        card.querySelector('.dashboard__card-hrs-previous')!.textContent =
            `${getPreviousPeriodLabel(timeframe)} - ${getHoursLabel(previous)}`;
    });
};

const setActiveTab = (activeTab: HTMLButtonElement): void => {

    tabs.forEach((tab) => {
        tab.classList.remove('dashboard__tab--active');
        tab.setAttribute('aria-selected', 'false');
    });
    
    activeTab.classList.add('dashboard__tab--active');
    activeTab.setAttribute('aria-selected', 'true');
};

const initDashboard = async (): Promise<void> => {

    try {
        activityData = await fetchData();

        const weeklyTab = tabs[1];
        setActiveTab(weeklyTab);
        updateCards(activityData, 'weekly');
    }
    catch (error) {
        console.error('Failed to initialize dashboard:', error);
    }
};

const handleTabClick = (event: Event): void => {
    const target = event.target as HTMLButtonElement;
    const timeframe = target.textContent?.toLowerCase() as 'daily' | 'weekly' | 'monthly';

    setActiveTab(target);
    updateCards(activityData, timeframe);
}

tabs.forEach((tab) => {
    tab.addEventListener('click', handleTabClick);
});

document.addEventListener('DOMContentLoaded', initDashboard);