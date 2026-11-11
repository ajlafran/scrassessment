import Assessment from "../components/Assessment";
import data from "../data/assessment.json";
import { config } from "../lib/config";

export default function Home() {
  return <Assessment questions={data.questions} config={config} />;
}
