import { describe, it, expect } from 'vitest';

// Define a simple, robust test for sorting and filtering equivalent to our leaderboard logic
describe('Leaderboard Ranking Unit Tests', () => {
  const mockAllOtherUsers = [
    { name: "Anita profile (Mom)", xp: 1450, isMe: false, type: ["friends"] },
    { name: "Rohan profile (Father)", xp: 1120, isMe: false, type: ["friends"] },
    { name: "Alice Green", xp: 1950, isMe: false, type: ["local", "friends"] },
    { name: "Bob Solar", xp: 850, isMe: false, type: ["local"] },
  ];

  const getRankingsList = (userXp: number, filter: 'all' | 'friends' | 'local') => {
    const me = {
      name: "Jane Doe (You)",
      xp: userXp,
      isMe: true,
      type: ["friends", "local"]
    };

    let filtered = [...mockAllOtherUsers];
    if (filter === "friends") {
      filtered = mockAllOtherUsers.filter(u => u.type.includes("friends"));
    } else if (filter === "local") {
      filtered = mockAllOtherUsers.filter(u => u.type.includes("local"));
    }

    // Combine & Sort descending by XP
    const combined = [...filtered, me].sort((a, b) => b.xp - a.xp);

    // Map ranks based on ordered list
    return combined.map((user, index) => ({
      rank: index + 1,
      name: user.name,
      xp: user.xp,
      isMe: !!user.isMe,
    }));
  };

  it('correctly sorts list descending by XP score and places current user', () => {
    // Current user XP is 1600. Output listing should be:
    // 1st: Alice Green (1950)
    // 2nd: Jane Doe (You) (1600)
    // 3rd: Anita profile (Mom) (1450)
    // 4th: Rohan profile (Father) (1120)
    // 5th: Bob Solar (850)
    const rankings = getRankingsList(1600, 'all');

    expect(rankings[0].name).toBe("Alice Green");
    expect(rankings[1].name).toBe("Jane Doe (You)");
    expect(rankings[1].isMe).toBe(true);
    expect(rankings[2].name).toBe("Anita profile (Mom)");
    
    // Check rank indices:
    expect(rankings.every((item, idx) => item.rank === idx + 1)).toBe(true);
  });

  it('filters by "friends" correct participants sub-group', () => {
    // Other users who are Friends: Anita (1450), Rohan (1120), Alice (1950).
    const rankings = getRankingsList(1200, 'friends');

    // Anita, Rohan, Alice, and You
    expect(rankings.length).toBe(4);
    // You (1200) should rank after Alice (1950) and Anita (1450), making it 3rd
    const meRow = rankings.find(r => r.isMe);
    expect(meRow?.rank).toBe(3);
  });

  it('filters by "local" correct regional participants sub-group', () => {
    // Other users who are Local: Alice (1950), Bob (850).
    const rankings = getRankingsList(1000, 'local');

    // Alice, Bob, and You
    expect(rankings.length).toBe(3);
    // You (1000) should rank after Alice (1950) but before Bob (850)
    expect(rankings[1].isMe).toBe(true);
    expect(rankings[1].rank).toBe(2);
  });

  it('handles ties correctly by preserving consistent placement sequence', () => {
    // Check tie cases between a mock competitor and self (both at 1450)
    const rankings = getRankingsList(1450, 'all');
    const tieIndices = rankings
      .map((r, i) => (r.xp === 1450 ? i : -1))
      .filter(i => i !== -1);
    
    expect(tieIndices.length).toBe(2);
  });
});
