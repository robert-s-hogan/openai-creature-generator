import { Configuration, OpenAIApi } from "openai";

import {
  calculateHitPoints,
  calculateStat,
  calculateActions,
  calculateSpecialAbilities,
} from "../../utils/calculate";

import creatureTypes from "../../data/creatureTypes";
import alignments from "../../data/alignments";
import environments from "../../data/environments";
import sizes from "../../data/sizes";
import specialTraits from "../../data/specialTraits";
import languages from "../../data/languages";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export function generateRandomValues() {
  // New code: Function to generate random values
  return {
    challengeRating: Math.floor(Math.random() * 30) + 1,
    creatureType:
      creatureTypes[Math.floor(Math.random() * creatureTypes.length)],
    alignment: alignments[Math.floor(Math.random() * alignments.length)],
    environment: environments[Math.floor(Math.random() * environments.length)],
    size: sizes[Math.floor(Math.random() * sizes.length)],
    specialTrait:
      specialTraits[Math.floor(Math.random() * specialTraits.length)],
    language: languages[Math.floor(Math.random() * languages.length)],
  };
}

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message:
          "OpenAI API key not configured, please follow instructions in README.md",
      },
    });
    return;
  }

  const { numberOfPlayers, playerLevel } = req.body;

  if (!numberOfPlayers || !playerLevel) {
    res.status(400).json({
      error: {
        message: "Please provide all required parameters",
      },
    });
    return;
  }

  try {
    // Generate random values and assign to a variable
    const randomValues = generateRandomValues();

    const completion = await openai.createCompletion({
      model: "text-davinci-003",
      prompt: generatePrompt(numberOfPlayers, playerLevel, randomValues),
      temperature: 0.6,
      max_tokens: 400,
    });

    let creature;
    try {
      creature = JSON.parse(completion.data.choices[0].text.trim());
    } catch (error) {
      console.error(`Error parsing generated text into JSON: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
      return;
    }

    res
      .status(200)
      .json({ result: creature, imagePrompt: creature.imagePrompt });
  } catch (error) {
    console.error("Detailed Error: ", error);
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: "An error occurred during your request.",
        },
      });
    }
  }
}

function generatePrompt(
  numberOfPlayers,
  playerLevel,
  {
    challengeRating,
    creatureType,
    alignment,
    environment,
    size,
    specialTrait,
    language,
  }
) {
  return `Create a detailed ${creatureType} for a DND game suitable for a party of ${numberOfPlayers} players at level ${playerLevel} with a challenge rating of ${challengeRating}.

The ${creatureType} is of size ${size}, lives in a ${environment}, and has an alignment of ${alignment}. It has a special trait: ${specialTrait}, and can communicate in ${language}.

The creature should have the following properties in a JSON-like format:

{
  "name": "Dire Wolf",
  "description": "A large, fearsome wolf with a thick fur coat and glowing red eyes. It has powerful jaws and a menacing stance.",
  "imagePrompt": "Create an image of a ${size}, fearsome wolf with a thick fur coat and glowing red eyes, and has an alignment of ${alignment}. It should have powerful jaws and a menacing stance.",
  "armorClass": 14,
  "hitPoints": 37,
  "speed": "50 ft.",
  "strength": 17,
  "dexterity": 15,
  "constitution": 15,
  "intelligence": 3,
  "wisdom": 12,
  "charisma": 7,
  "actions": [
    {
      "name": "Bite",
      "damage": "2d6 + 3",
      "reach": "5 ft."
    }
  ],
  "specialAbilities": [
    {
      "name": "Keen Hearing and Smell",
      "description": "The wolf has advantage on Wisdom (Perception) checks that rely on hearing or smell."
    },
    {
      "name": "Pack Tactics",
      "description": "The wolf has advantage on attack rolls against a creature if at least one of the wolf's allies is within 5 feet of the creature and the ally isn't incapacitated."
    }
  ]
}


Now, create a similar creature: `;
}
