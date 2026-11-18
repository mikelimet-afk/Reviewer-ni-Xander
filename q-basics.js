/* Foundation math (Easy). Written for learners rebuilding the basics: one skill per item,
   small numbers, and explanations that show every step. Correct answer is always FIRST. */
D(1);

/* ---------- Fractions, decimals, percent ---------- */
Q("math","arithmetic","Which fraction is the same as 1/2?",["4/8","2/3","3/4","1/4"],"Multiply the top and bottom of 1/2 by the same number. 1 × 4 = 4 and 2 × 4 = 8, so 1/2 = 4/8.");
Q("math","arithmetic","1/4 + 2/4 = ?",["3/4","3/8","2/4","1/2"],"The bottoms (denominators) are already the same, so add only the tops: 1 + 2 = 3. Keep the bottom: 3/4. Never add the bottoms.");
Q("math","arithmetic","1/2 + 1/3 = ?",["5/6","2/5","2/6","1/6"],"Make the bottoms the same first. 6 works for both: 1/2 = 3/6 and 1/3 = 2/6. Now add the tops: 3 + 2 = 5. Answer: 5/6.");
Q("math","arithmetic","2/3 × 3/5 = ?",["2/5","6/8","5/15","10/9"],"Multiply top × top and bottom × bottom: (2 × 3)/(3 × 5) = 6/15. Simplify by dividing both by 3: 2/5.");
Q("math","arithmetic","3/4 ÷ 1/2 = ?",["3/2","3/8","1/2","2/3"],"Keep, change, flip: keep 3/4, change ÷ to ×, flip 1/2 to 2/1. Then 3/4 × 2/1 = 6/4 = 3/2.");
Q("math","arithmetic","Write 0.75 as a fraction in lowest terms.",["3/4","75/10","7/5","1/75"],"0.75 means 75 hundredths = 75/100. Divide top and bottom by 25: 3/4.");
Q("math","arithmetic","What is 50% of 86?",["43","50","36","172"],"50% means half. Half of 86 is 86 ÷ 2 = 43.");
Q("math","arithmetic","What is 10% of 350?",["35","3.5","350","10"],"10% means divide by 10: move the decimal point one place to the left. 350 → 35.");
Q("math","arithmetic","Change 3/5 to a percent.",["60%","35%","53%","30%"],"Make the bottom 100: 5 × 20 = 100, so multiply the top by 20 too: 3 × 20 = 60. 60/100 = 60%.");
Q("math","arithmetic","0.4 × 0.2 = ?",["0.08","0.8","8","0.6"],"Multiply as whole numbers: 4 × 2 = 8. Count the decimal places in the question: one in 0.4 and one in 0.2, so two in all. 8 → 0.08.");

/* ---------- Signed numbers and order of operations ---------- */
Q("math","arithmetic","−7 + 3 = ?",["−4","4","−10","10"],"Start at −7 on the number line and move 3 steps to the right (toward zero): −6, −5, −4.");
Q("math","arithmetic","5 − 9 = ?",["−4","4","−14","14"],"9 is bigger than 5, so the answer is negative. The difference between 9 and 5 is 4, so 5 − 9 = −4.");
Q("math","arithmetic","(−6) × (−4) = ?",["24","−24","−10","10"],"Negative × negative = positive. 6 × 4 = 24, so the answer is +24.");
Q("math","arithmetic","−3 − (−8) = ?",["5","−11","11","−5"],"Subtracting a negative is the same as adding: −3 − (−8) = −3 + 8. Start at −3, move 8 right: 5.");
Q("math","arithmetic","8 + 2 × 5 = ?",["18","50","15","20"],"Multiplication comes before addition (PEMDAS). First 2 × 5 = 10. Then 8 + 10 = 18. Adding first gives the wrong answer 50.");
Q("math","arithmetic","(4 + 2)² ÷ 3 = ?",["12","6","36","4"],"Parentheses first: 4 + 2 = 6. Exponent: 6² = 36. Then divide: 36 ÷ 3 = 12.");

/* ---------- Simple equations ---------- */
Q("math","algebra","Solve: <i>x</i> + 7 = 12",["5","19","7","12"],"Undo +7 by subtracting 7 from both sides: <i>x</i> = 12 − 7 = 5. Check: 5 + 7 = 12 ✓");
Q("math","algebra","Solve: 3<i>x</i> = 21",["7","18","24","63"],"3<i>x</i> means 3 × <i>x</i>. Undo × 3 by dividing both sides by 3: <i>x</i> = 21 ÷ 3 = 7.");
Q("math","algebra","Solve: 2<i>x</i> − 4 = 10",["7","3","14","6"],"Step 1: add 4 to both sides → 2<i>x</i> = 14. Step 2: divide both sides by 2 → <i>x</i> = 7. Check: 2(7) − 4 = 10 ✓");
Q("math","algebra","If <i>x</i> = 3, what is 4<i>x</i> + 1?",["13","8","35","43"],"Replace <i>x</i> with 3: 4 × 3 + 1 = 12 + 1 = 13. (4<i>x</i> means 4 times <i>x</i>, not 43.)");

/* ---------- Basic geometry and data ---------- */
Q("math","geometry","A rectangle is 8 cm long and 3 cm wide. What is its perimeter?",["22 cm","24 cm","11 cm","48 cm"],"Perimeter = all the sides added: 8 + 3 + 8 + 3 = 22 cm. (24 is the area in cm², a different thing.)");
Q("math","geometry","A rectangle is 8 cm long and 3 cm wide. What is its area?",["24 cm²","22 cm²","11 cm²","32 cm²"],"Area = length × width = 8 × 3 = 24 square centimeters.");
Q("math","geometry","Two angles of a triangle are 50° and 60°. What is the third angle?",["70°","110°","90°","80°"],"All three angles of a triangle add up to 180°. 50 + 60 = 110. Then 180 − 110 = 70°.");
Q("math","stats","What is the average (mean) of 4, 6 and 8?",["6","18","4","8"],"Add them: 4 + 6 + 8 = 18. Divide by how many numbers there are (3): 18 ÷ 3 = 6.");

/* ---------- Reading: tone and purpose (Real exam level) ---------- */
D(3);
P("p9","The Last Jeepney Driver on Our Street","<p>Mang Ruben has driven the same route for thirty-one years. He knows which passengers ride every morning, which ones will pay tomorrow if they are short today, and which corner floods first when the rain comes. His jeepney, painted with a faded horse and his daughters’ names, is older than most of the students who ride it.</p><p>Next month the old jeepneys on our route will be replaced by modern minibuses with air conditioning and card readers. The new vehicles are cleaner and safer; few people on our street would argue otherwise. Yet when the announcement came, the passengers did not cheer. They asked Mang Ruben whether he would be driving one of the new ones. He laughed and said he was too old to learn a card reader.</p><p>Progress usually arrives as a list of improvements. What it rarely lists is what it will quietly take away: a driver who waits an extra minute for the girl who is always late, a fare paid with a promise. Those things were never written in any plan, which is exactly why no plan will replace them.</p>");
Q("english","reading","The author’s tone toward the new minibuses can best be described as:",["accepting but wistful","angry and opposed","excited and approving","confused and uncertain"],"The author admits the minibuses are “cleaner and safer” (accepting) but mourns what will be lost (wistful). There is no anger in the passage.","p9");
Q("english","reading","The main purpose of the passage is to:",["reflect on the human connections that modernization can leave out","argue that jeepneys should never be replaced","explain how card readers work","describe the history of the jeepney"],"The last paragraph states the point: progress lists improvements but not what it “quietly take[s] away”. That is a reflection, not an argument against change.","p9");
Q("english","reading","Why does the author mention the fare “paid with a promise”?",["to show the trust between Mang Ruben and his passengers","to complain that passengers do not pay","to explain how card readers will collect fares","to show that Mang Ruben is careless with money"],"Letting regular passengers pay tomorrow shows a personal, trusting relationship — one of the things the author says no plan can replace.","p9");
Q("english","reading","Which statement would the author most likely agree with?",["Some valuable things are lost because no one thought to measure them.","Modern vehicles are more dangerous than jeepneys.","Older drivers should be forced to retire.","Passengers prefer air conditioning to everything else."],"“Those things were never written in any plan, which is exactly why no plan will replace them.” The other choices contradict or go beyond the passage.","p9");
Q("english","reading","The passengers’ reaction to the announcement suggests that they:",["cared more about Mang Ruben than about the new features","were happy about the air conditioning","did not understand the announcement","wanted higher fares"],"Instead of cheering the improvements, they asked whether Mang Ruben would still drive — their concern was for him.","p9");
D(1);
