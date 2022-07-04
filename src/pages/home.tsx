import { Link } from '@tanstack/react-location';

function Home() {
  return (
    <div>
      <div className="mb-8 mt-8">
        <div className="text-2xl mb-4">
          Discover Semaphore in a three step journey
        </div>
      </div>
      <div className="px-8 py-4 border-2 rounded border-current shadow-md max-w-lg flex flex-col text-sm">
        <h1 className="text-lg mb-4">What is Semaphore?</h1>
        <div className="mb-4">
          <div>
            {`"`}Semaphore is a zero-knowledge protocol that allows users to
            prove their membership in a group and send signals such as votes or
            endorsements without revealing their identity.
          </div>
          <div>
            Additionally, it provides a simple mechanism to prevent
            double-signaling.
          </div>
          <div>
            Use cases include private voting, whistleblowing, anonymous DAOs and
            mixers.{`"`}
          </div>
        </div>
        <div className="self-end">
          Said by a wise person in the{' '}
          <a
            className="hover:underline hover:underline-offset-2"
            href="https://semaphore.appliedzkp.org/docs/introduction"
          >
            doc
          </a>
        </div>
      </div>
      <div className="flex flex-col justify-between mt-8">
        <div className="mb-2">
          1. Generate your provable anonymous public identity
        </div>
        <div className="mb-2">
          2. Add your anonymous public identity to a group
        </div>
        <div className="mb-2">3. Anonymously broadcast a signal</div>
        <Link
          className="mt-4 text-lg self-center hover:underline hover:underline-offset-2"
          to="/identity"
        >
          First stop: Identity {'->'}
        </Link>
      </div>
    </div>
  );
}

export default Home;
