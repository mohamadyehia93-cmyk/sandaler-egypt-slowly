import { useI18n } from "@/lib/i18n";

type TopTabsProps = {
  activeTab: string;
  onTabChange: (tab: string) => void;
};

const tabs = [
  { key: "explore", labelKey: "tab.explore" },
  { key: "experiences", labelKey: "tab.experiences" },
  { key: "trips", labelKey: "tab.trips" },
];

const TopTabs = ({ activeTab, onTabChange }: TopTabsProps) => {
  const { t } = useI18n();

  return (
    <div className="flex justify-center gap-1 px-4 py-3 bg-transparent">
      {tabs.map(({ key, labelKey }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
            activeTab === key
              ? "bg-primary-dark text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {t(labelKey)}
        </button>
      ))}
    </div>
  );
};

export default TopTabs;
