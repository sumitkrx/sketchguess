export function buildMask(word:string):string{
    return word.replace(/[a-zA-Z]/g,"_");
    // "cat" -> "___" | "ice cream" -> "___ _____"
}

export function revealOneChar(word:string, mask: string):string{
    const hidden: number[] = [];
    for(let i = 0; i < word.length; i++){
        if(/[a-zA-Z]/.test(word[i] ?? "") && mask[i] === "_") hidden.push(i);
    }
    if(hidden.length === 0) return mask;
    const pos = hidden[Math.floor(Math.random() * hidden.length)]!;
    return mask.substring(0,pos) + word[pos] + mask.substring(pos + 1);
}

export function isCorrectGuess(guess:string, word:string) : boolean {
    return guess.toLocaleLowerCase().trim() === word.toLocaleLowerCase();
}

export function isCloseGuess(guess:string, word:string): boolean {
    return levenshtein(guess.toLocaleLowerCase(), word.toLocaleLowerCase()) <= 1;
}

function levenshtein(a:string, b:string): number {
    const m = a.length, n = b.length;
    const dp:number[][] = Array.from({length: m + 1 }, (_,i) =>
        Array.from({length: n+1 }, (_,j) => (i === 0 ? j : j === 0 ? i : 0))
    );

    for(let i=1; i <= m; i++){
        for (let j = 0; j <= n; j++){
            dp[i]![j] = a[i-1] === b[j-1]
                ? dp[i-1]![j]!
                : 1 + Math.min(dp[i-1]![j]!, dp[i]![j-1]!, dp[i-1]![j-1]!);
        }
    }

    return dp[m]![n]!;
}