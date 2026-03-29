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
    <div className="flex border-b border-border bg-background sticky top-0 z-40">
      {tabs.map(({ key, labelKey }) => (
        <button
          key={key}
          onClick={() => onTabChange(key)}
          className={`flex-1 py-3 text-sm font-semibold transition-colors relative ${
            activeTab === key ? "text-primary-dark" : "text-muted-foreground"
          }`}
        >
          {t(labelKey)}
          {activeTab === key && (
            <span className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-primary rounded-t-full" />
          )}
        </button>
      ))}
    </div>
  );
};

export default TopTabs;
