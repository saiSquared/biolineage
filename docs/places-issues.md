# Places Issues

## Fixes

```js
const placeFixes = [
  {
    ogName: 'Marion County',
    ogCountry: null,
    ogRegion: null,
    ogCity: null,
    uuid: 'b8123bc6-fb68-475d-96b6-a8634ef87524'
  },
  {
    ogName: 'Marengo Coounty',
    ogCountry: 'us',
    ogRegion: 'AL',
    ogCity: null,
    uuid: '02be28fd-6498-478a-b3e2-ebf37029fa75'
  },
  {
    ogName: 'Shands Hospital',
    ogCountry: 'us',
    ogRegion: 'FL',
    ogCity: 'Gainsville',
    uuid: 'bf35f0e7-f801-452b-930e-e2d7fd47d1c0'
  },
  {
    ogName: 'Sumter Cemetary',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Sumter',
    uuid: 'a0a35d5b-6fbe-4160-aaba-843a4dc8f1a5'
  },
  {
    ogName: 'Old Johnsonville Cemetary',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Johnsonville',
    uuid: '65a31b18-d052-475b-873a-34fd1393457a'
  },
  {
    ogName: 'Old Johnsonville Cemetary',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Jonhsonville',
    uuid: '65a31b18-d052-475b-873a-34fd1393457a'
  },
  {
    ogName: null,
    ogCountry: 'de',
    ogRegion: 'BW',
    ogCity: 'Leinfelden Stutgart',
    uuid: '201c8ccb-8124-4e4c-bda4-60757ef86d40'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: null,
    ogCity: 's',
    uuid: '5a870dc8-aff3-49d3-8ef7-47099457264e'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'MD',
    ogCity: 'Silver Sprinig',
    uuid: '712e4e62-29e3-4090-bf3e-314a3695a1b0'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'MD',
    ogCity: 'Silver spring',
    uuid: '712e4e62-29e3-4090-bf3e-314a3695a1b0'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'NY',
    ogCity: 'NYC',
    uuid: 'e7e00cba-707f-435c-87b1-9593f5f04392'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'NY',
    ogCity: 'New York',
    uuid: 'e7e00cba-707f-435c-87b1-9593f5f04392'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Lynches Rover',
    uuid: '5d3a8488-37c5-469a-95b7-85b7362a4f15'
  },
  {
    ogName: null,
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Sumte',
    uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
  },
  {
    ogName: '?',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Sumter',
    uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
  },
  {
    ogName: 'Evergreen Cemetary',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Sumter',
    uuid: '4de025c7-059b-446b-996c-7b8cae18f9df'
  },
  {
    ogName: 'tbd',
    ogCountry: 'us',
    ogRegion: null,
    ogCity: null,
    uuid: '5a870dc8-aff3-49d3-8ef7-47099457264e'
  },
  {
    ogName: 'Home',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Sumter',
    uuid: '669063ea-d9c5-4faa-9b0b-6267b9bc62bb'
  },
  {
    ogName: 'Manning Cemetery age 57.5 hours',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Manning',
    uuid: '3afff307-6683-4d7b-8fd3-4cbebb8b5aee'
  },
  {
    ogName: 'Manning Cemetrery',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Manning',
    uuid: '3afff307-6683-4d7b-8fd3-4cbebb8b5aee'
  },
  {
    ogName: 'some say born 1732',
    ogCountry: 'gb',
    ogRegion: null,
    ogCity: null,
    uuid: 'd3c13577-3379-47e7-b9f1-7c55d4542f21'
  },
  {
    ogName: 'Robeson County, NC',
    ogCountry: 'us',
    ogRegion: 'NC',
    ogCity: null,
    uuid: 'a8132416-8bd8-4feb-b7c1-4914101e30c7'
  },
  {
    ogName: 'a',
    ogCountry: 'us',
    ogRegion: 'CA',
    ogCity: null,
    uuid: '5b98ae04-9502-40d7-ad6a-a8eb00bc8b9f'
  },
  {
    ogName: 'died young',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Timmonsville',
    uuid: '45768b17-ee48-4a9e-a7e8-4c9d0e4745cb'
  },
  {
    ogName: 'some say died 9/30/1819',
    ogCountry: 'us',
    ogRegion: 'SC',
    ogCity: 'Lynches River',
    uuid: '5d3a8488-37c5-469a-95b7-85b7362a4f15'
  },
  {
    ogName: 'Tappan',
    ogCountry: null,
    ogRegion: 'NY',
    ogCity: null,
    uuid: '5daaa0a7-aeb3-4e0f-97d0-4ef8150b54fb'
  }
]

const fixPlace = (data) => {
  const match = placeFixes.find(rule =>
    rule.ogName === data.ogName &&
    rule.ogCountry === data.ogCountry &&
    rule.ogRegion === data.ogRegion &&
    rule.ogCity === data.ogCity
  )

  return match ? match.uuid : data.uuid
}
```

## Discussion

These require decision from Norm and Charles

---

## **Case: New York vs Orange (New York)**

- **id 1:** “New York”, no city
- **id 2:** “Orange (New York)”, city = Orange

**Issue:**

- “New York” is ambiguous (state? city? county?).
- “Orange” may refer to Orange County or the town of Orange.
- Structured fields do not clarify intended level.

**Decision needed:**

- Should “New York” be treated as the state or the city?
- Should “Orange” be normalized to Orange County?
- Are these separate intended places?

---

## **Case: Texas vs Corsicana (Texas)**

- **id 3:** “Texas”, no city
- **id 4:** “Corsicana (Texas)”, city = Corsicana

**Issue:**

- “Texas” is ambiguous (state vs general location).
- “Corsicana” is a specific city.
- Unclear whether “Texas” is meant as a general birthplace or missing city.

**Decision needed:**

- Should “Texas” be treated as the state?
- Should “Texas” be merged with Corsicana if referring to same person?
- Or kept separate?

---

## **Case: Leinfelden Stuttgart vs Musberg Stuttgart (Germany)**

- **id 8:** “Leinfelden Stuttgart”
- **id 9:** “Musberg Stuttgart”

**Issue:**

- Both are concatenations of Stuttgart + a district of Leinfelden‑Echterdingen.
- Not actual city names.
- Unclear intended locality.

**Decision needed:**

- Should these be split into Stuttgart vs Leinfelden‑Echterdingen?
- Should they be merged?
- Should they be rewritten as districts?

---

## **Case: South Korea ambiguous localities**

- **id 14:** Hamongji
- **id 15:** Hamung
- **id 16:** Jungpyongkun
- **id 17:** Poyngyang
- **id 19:** Hamung (HKN)

**Issue:**

- All appear to be mis‑transliterations.
- “Poyngyang” is Pyongyang (North Korea).
- “Hamung” likely Hamhung (North Korea).
- Country field incorrectly says South Korea.

**Decision needed:**

- Confirm intended country (North vs South Korea).
- Confirm intended locality.
- Decide whether to merge Hamung variants.

---

## **Case: Overijssel (Netherlands)**

- **id 23:** Overijssel (Netherlands)

**Issue:**

- Overijssel is a province, not a city.
- Structured fields treat it as a city.

**Decision needed:**

- Should this be converted to Region?
- Or kept as Discussion?

---

## **Case: Silver Valley (United States)**

- **id 29:** Silver Valley (United States)

**Issue:**

- Multiple Silver Valleys exist (NC, ID, CA).
- No region or city provided.

**Decision needed:**

- Identify intended state.
- Decide whether to create multiple Silver Valley entries.

---

## **Case: Escambia vs Escambria (Florida)**

- **id 42:** Escambia
- **id 43:** Escambria

**Issue:**

- Escambia is a county, not a city.
- Escambria is a misspelling.
- Structured fields treat both as cities.

**Decision needed:**

- Should both be normalized to Escambia County?
- Should they remain separate?
- Should city be removed?

---

## **Case: Franklin (Florida)**

- **id 44:** Franklin (Florida)

**Issue:**

- Franklin is a county, not a city.
- Structured fields treat it as a city.

**Decision needed:**

- Should this be converted to County?
- Or kept as ambiguous?

---

## **Case: Tyrrell County ambiguity**

- **id 62:** Tyrrell (North Carolina)

**Issue:**

- Tyrrell is a county, not a city.
- Structured fields treat it as a city.

**Decision needed:**

- Should this be converted to County?
- Should city be removed?

---

## **Case: Bullington (New Jersey)**

- **id 63:** Bullington (New Jersey)

**Issue:**

- No known locality named Bullington in NJ.
- Likely mis‑entry.

**Decision needed:**

- Identify intended place.
- Possibly remove or rewrite.

---

## **Case: Canden (New Jersey)**

- **id 64:** Canden (New Jersey)

**Issue:**

- Misspelling of Camden.
- Needs confirmation.

**Decision needed:**

- Should this be corrected to Camden?
- Or kept separate?

---

## **Case: Orangetown vs Tappan (New York)**

- **id 74:** Orangetown
- **id 75:** Tappan

**Issue:**

- Both are hamlets/towns in Rockland County.
- Structured fields treat them as cities.
- “Bew York” misspelling corrected.

**Decision needed:**

- Should these be typed as Town or Community?
- Should they be linked to Rockland County?

---

## **Case: Anderson County Hospital vs Anderson County Cemetery**

- **id 105:** Anderson County Hospital
- **id 106:** Anderson County Cemetery

**Issue:**

- Both refer to Anderson County but different facility types.
- Cemetery is in Pendleton; hospital location unclear.

**Decision needed:**

- Confirm hospital location.
- Confirm cemetery location.
- Decide whether to create Anderson County as a region.

---

## **Case: Arlington National Cemetery (Springfield, VA)**

- **id 107:** Arlington National Cemetery (Springfield)

**Issue:**

- Arlington National Cemetery is in Arlington, not Springfield.
- Structured fields incorrect.

**Decision needed:**

- Correct city?
- Keep as ambiguous?

---

## **Case: Berkeley/Berkley County variants**

- **id 111:** Berkeley County
- **id 112:** Berkley County (Christ Church Parish)
- **id 113:** Berkley County (Saewee Bay)

**Issue:**

- Spelling variants.
- Multiple associated localities.
- Some historic (Christ Church Parish).

**Decision needed:**

- Should all be merged to Berkeley County?
- Should historic parish variants remain separate?

---

## **Case: Johnsonville (Columbia)**

- **id 116:** Johnsonville (Columbia)

**Issue:**

- “Buried at Johnsonville SC” placed in city field.
- Columbia is incorrect.

**Decision needed:**

- Should city be removed?
- Should this be merged with Johnsonville?

---

## **Case: Denton Town Cemetery (Lansdowne, MD)**

- **id 131:** Denton Town Cemetery (Lansdowne)

**Issue:**

- Denton is in Caroline County, not Lansdowne.
- Structured fields incorrect.

**Decision needed:**

- Confirm intended cemetery.
- Correct locality.

---

## **Case: Dixon Mills (Marengo County)**

- **id 132:** Dixon Mills?

**Issue:**

- “Dixon Mills?” indicates uncertainty.
- Needs confirmation.

**Decision needed:**

- Confirm intended locality.
- Remove question mark.

---

## **Case: Dorcetshire (LymeRegis)**

- **id 133:** Dorcetshire (LymeRegis)

**Issue:**

- Misspelling of Dorsetshire.
- Historic county name.
- Mixed with city.

**Decision needed:**

- Should this be normalized to Dorset?
- Should historic name be preserved?

---

## **Case: Gainesville (Florida)**

- **id 138:** Gainesville FL?

**Issue:**

- “FL?” indicates uncertainty.
- Missing structured fields.

**Decision needed:**

- Confirm intended locality.
- Remove question mark.

---

## **Case: Gates of Heaven Cemetery (Maryland)**

- **id 139:** Gates of Heaven Cemetery

**Issue:**

- Missing city (Aspen Hill).
- Needs confirmation.

**Decision needed:**

- Should city be added?
- Should this be normalized?

---

## **Case: Ladies Clinic (Japan)**

- **id 153:** Ladies Clinic (Japan)

**Issue:**

- Generic name.
- No city or region.
- Cannot normalize.

**Decision needed:**

- Identify intended locality.
- Possibly remove.

---

## **Case: Lexington (Columbia)**

- **id 154:** Lexington (Columbia)

**Issue:**

- Lexington is a city in Lexington County.
- Columbia is incorrect.

**Decision needed:**

- Should city be removed?
- Should this be merged with Lexington?

---

## **Case: Louisville Bluegrass Planting Grounds (Netherlands)**

- **id 155:** Louisville Bluegrass Planting Grounds

**Issue:**

- Kentucky horse facility placed in Netherlands.
- “Horse‑Raising Town” is narrative.

**Decision needed:**

- Identify intended locality.
- Remove narrative text.

---

## **Case: New Hope Burying Ground variants**

- **id 163:** Darlington District
- **id 164:** Manning

**Issue:**

- Same cemetery name, different associated places.
- One historic district, one modern city.
- Narrative text in ogName.

**Decision needed:**

- Confirm actual cemetery location.
- Decide whether to merge or keep separate.

---

## **Case: Old Johnsonville Cemetery variants**

- **id 168:** Old Johnsonville Cemetery
- **id 169:** Old Johnsonville Methodist Church Cemetery
- **id 170:** Ole Johnsonville Cemetery

**Issue:**

- Multiple naming variants.
- Denominational variant.
- Misspellings (“Ole”, “Cemetary”).
- Likely same cemetery or adjacent ones.

**Decision needed:**

- Confirm whether these are one or multiple cemeteries.
- Decide whether to merge.
