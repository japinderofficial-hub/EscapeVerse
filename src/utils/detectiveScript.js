export const DETECTIVE_INTRO = `
--- DETECTIVE MODE INITIALIZED ---

Case File #001: The Crimson Ledger

Location: Veridian City Museum
Time: 10:15 PM

A priceless diamond known as "The Crimson Ledger", worth over $25 million, has disappeared from the city's most secure museum.
But the theft wasn't the worst part.
Minutes later, the museum's head security officer, Raj Malhotra, is found murdered in the basement.
The museum is immediately locked down. No one is allowed to leave.

You are Detective Ethan Carter, one of the country's best investigators. Your mission is to uncover the truth before the killer escapes justice.

Suspects:
1. Aarav Kapoor (Museum Curator, 42)
2. Meera Sharma (Security Supervisor, 31)
3. Vikram Singh (Night Cleaner, 50)
4. Nisha Verma (Investigative Journalist, 28)
5. Rohan Mehta (Art Collector, 38)

Crime Scene Evidence:
- A shattered display case.
- Blood stains leading toward the basement.
- A dropped security access card.
- A half-burned note with missing words: "...storage... tonight... don't fail..."
- A single black leather glove.
- The victim's broken wristwatch, stopped at 10:11 PM.
- Partial muddy footprints.
- A fingerprint on the display glass that doesn't belong to museum staff.

You can now begin interrogating the suspects to find the killer.
`;

export const DETECTIVE_SCRIPT = `
${DETECTIVE_INTRO}

(AI SECRET NOTE FOR GENERATING RESPONSES:
The true mastermind and culprit is Rohan Mehta (The Art Collector). He is the actual owner of "The Crimson Ledger" who loaned it to the museum. He orchestrated the fake theft of his own gem to claim a massive government insurance policy payout. Security Officer Raj caught his hired thieves swapping the gem, so Rohan had him killed. 
As Rohan Mehta, act overly confident but subtly defensive if pressed about insurance or money. If the player interrogates other suspects, they are innocent but might be hiding personal secrets.)
`;
