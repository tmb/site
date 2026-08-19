export default function NotBanks() {
  return (
    <div className="flex flex-col gap-4">
      <p>
        Many companies have suspiciously bank-like operations (origination,
        custody, lending) despite not being banks or financial technology
        companies. Please{' '}
        <a
          href="https://x.com/theombl"
          target="_blank"
          rel="noopener noreferrer"
        >
          tweet at me
        </a>{' '}
        and suggest more!
      </p>

      <p>
        - <span className="font-bold">Starbucks</span> custodies $1.5-2B of
        Starbucks card value (&ldquo;stored value card liability&rdquo;) at any
        given time. Users deposit using the mobile app to get greater rewards
        when buying coffee. Deposited value is broken up into cohorts by
        geography/channel/vintage, and breakage, value that statistically
        won&rsquo;t be used, is recognized as revenue quarterly. In 2025,
        Starbucks recognized $222.4M in breakage revenue.
      </p>

      <p>
        - <span className="font-bold">Verizon</span> originates billions of
        dollars ($6B in 2025, $7B in 2026 as of August) worth of cell
        phone-secured loans yearly. They&rsquo;re packaged up quarterly and
        syndicated as part of the{' '}
        <a
          href="https://www.sec.gov/edgar/browse/?CIK=0001844964"
          target="_blank"
          rel="noopener noreferrer"
        >
          Verizon Master Trust
        </a>
        , paying out ~50bps above treasuries for a senior claim.{' '}
        <span className="italic">thank you to Sam Catania.</span>
      </p>
    </div>
  )
}
