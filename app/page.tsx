import AppBar from './_components/app-bar';
import Footer from './_components/footer';
import ChanceCalculatorCard from './_components/chance-calc-card';
import GuideButtonContent from './_components/guide-button-content';
import RunTrackerCard from './_components/run-tracker-card';
import ShouldRollCard from './_components/should-roll-card';

export default function Home() {
  return (
    <div className='min-w-sm max-w-7xl mx-auto p-4 flex flex-col min-h-screen'>
      <AppBar />
      <div className='flex justify-center'>
        <div className='grid md:grid-cols-2 gap-4'>
          <div className='flex flex-col gap-4'>
            <ShouldRollCard />
            <GuideButtonContent />
            <RunTrackerCard />
          </div>
          <ChanceCalculatorCard />
        </div>
      </div>
      <div className='mt-auto'>
        <Footer />
      </div>
    </div>
  );
}
