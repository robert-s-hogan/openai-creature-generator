import Head from "next/head";
import { useState } from "react";
import styles from "./index.module.css";
import { GiDoubleDragon } from "react-icons/gi";

export default function Home() {
  const [challengeRating, setChallengeRating] = useState("");
  const [numberOfMonsters, setNumberOfMonsters] = useState("");
  const [numberOfPlayers, setNumberOfPlayers] = useState("");
  const [playerLevel, setPlayerLevel] = useState("");
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false); // Add loading state
  const [image, setImage] = useState();
  const [imagePrompt, setImagePrompt] = useState();

  async function onSubmit(event) {
    event.preventDefault();
    setLoading(true); // Set loading to true when the form is submitted

    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          challengeRating,
          numberOfPlayers,
          playerLevel,
        }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw (
          data.error ||
          new Error(`Request failed with status ${response.status}`)
        );
      }

      const creature = data.result;
      setResult(<CreatureCard creature={creature} />);
      setImagePrompt(creature.imagePrompt);

      // New code: Generate image
      try {
        const imageResponse = await fetch("/api/generateImage", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            imagePrompt: creature.imagePrompt,
          }),
        });

        const imageData = await imageResponse.json();
        if (imageResponse.status !== 200) {
          throw (
            imageData.error ||
            new Error(
              `Image request failed with status ${imageResponse.status}`
            )
          );
        }

        const imageUrl = imageData.imageUrl;
        setImage(imageUrl);
      } catch (error) {
        console.error(`Error with OpenAI API request: ${error}`);
        alert(error.message);
      }
      setChallengeRating("");
      setNumberOfPlayers("");
      setPlayerLevel("");
    } catch (error) {
      // Consider implementing your own error handling logic here
      console.error(error);
      alert(error.message);
    } finally {
      setLoading(false); // Set loading to false when the request is done
    }
  }

  function CreatureCard({ creature }) {
    return (
      <div className='creature-card'>
        <h2 className='text-2xl'>{creature.name}</h2>
        <p>{creature.description}</p>

        <hr className='my-2 h-0.5 border-t-0 bg-neutral-100' />
        <div className='flex-col'>
          <p>Armor Class: {creature.armorClass}</p>
          <p>Hit Points: {creature.hitPoints}</p>
          <p>Speed: {creature.speed}</p>
        </div>
        <hr className='my-2 h-0.5 border-t-0 bg-neutral-100' />
        <div className='flex space-x-2'>
          <div className='flex-col text-center'>
            <p>STR</p>
            <p>{creature.strength}</p>
          </div>
          <div className='flex-col text-center'>
            <p>DEX</p>
            <p>{creature.dexterity}</p>
          </div>
          <div className='flex-col text-center'>
            <p>CON</p>
            <p>{creature.constitution}</p>
          </div>
          <div className='flex-col text-center'>
            <p>INT</p>
            <p>{creature.intelligence}</p>
          </div>
          <div className='flex-col text-center'>
            <p>WIS</p>
            <p>{creature.wisdom}</p>
          </div>
          <div className='flex-col text-center'>
            <p>CHA</p>
            <p>{creature.charisma}</p>
          </div>
        </div>
        <hr className='my-2 h-0.5 border-t-0 bg-neutral-100' />
        <p className='mb-1'>Actions:</p>
        <div className='space-y-2'>
          {creature.actions &&
            creature.actions.map((action, index) => (
              <p key={index} className='mt-1'>
                <b>
                  <i>{action.name}</i>
                </b>
                : {action.damage}
              </p>
            ))}
        </div>
        <hr className='my-2 h-0.5 border-t-0 bg-neutral-100' />
        <p className='mb-1'>Special Abilities:</p>

        <div className='space-y-2'>
          {creature.specialAbilities &&
            creature.specialAbilities.map((ability, index) => (
              <p key={index} className='mt-1'>
                <b>
                  <i>{ability.name}</i>
                </b>
                : {ability.description}
              </p>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <Head>
        <title>OpenAI Quickstart</title>
        <link rel='icon' href='/dog.png' />
      </Head>

      <main className={styles.main}>
        <GiDoubleDragon className='text-6xl' />
        <h3>Create DND Monster</h3>
        <form onSubmit={onSubmit}>
          <div className='flex flex-col space-y-4'>
            <input
              type='number'
              name='challengeRating'
              placeholder='Enter Challenge Rating'
              value={challengeRating}
              onChange={(e) => setChallengeRating(e.target.value)}
            />
            <input
              type='number'
              name='numberOfPlayers'
              placeholder='Enter Number of Players'
              value={numberOfPlayers}
              onChange={(e) => setNumberOfPlayers(e.target.value)}
            />
            <input
              type='number'
              name='playerLevel'
              placeholder='Enter Player Level'
              value={playerLevel}
              onChange={(e) => setPlayerLevel(e.target.value)}
            />

            <input type='submit' value='Generate Creature' />
          </div>
        </form>
        {loading ? (
          <div className='mt-12'>Loading...</div>
        ) : (
          <div className='grid grid-cols-1 mt-24'>
            <div
              className={`grid gap-12 place-items-center font-mono ${
                image ? `bg-gray-900` : ""
              }`}>
              <div
                className={`${
                  image ? `bg-gray-900 shadow-lg` : ""
                } rounded-md p-6`}>
                <div className='md:flex px-4 leading-none'>
                  <div className='flex-col space-y-4'>
                    {image && (
                      <img
                        src={image}
                        alt='pic'
                        className='h-72 w-full rounded-md transform border-4 border-gray-300 shadow-lg'
                      />
                    )}
                    {imagePrompt && (
                      <span className='text-gray-300 pt-4'>{imagePrompt}</span>
                    )}
                  </div>

                  <div className='text-gray-300 pl-4'>
                    <div className={styles.result}>{result}</div>
                  </div>
                </div>
                {/* <div className='flex justify-between items-center px-4 mb-4 w-full'>
                <div className='flex'>
                  <i className='material-icons mr-2 text-red-600'>
                    favorite_border
                  </i>
                  <i className='material-icons text-blue-600'>remove_red_eye</i>
                </div>
                <div className='flex'>
                  <i className='material-icons ml-2 text-yellow-600'>
                    sentiment_very_satisfied
                  </i>
                  <i className='material-icons ml-2 text-yellow-600'>
                    sentiment_neutral
                  </i>
                  <i className='material-icons ml-2 text-yellow-600'>
                    sentiment_very_dissatisfied
                  </i>
                  <i className='material-icons ml-2 text-yellow-600'>
                    star_outline
                  </i>
                  <i className='material-icons ml-2 text-yellow-600'>
                    star_half
                  </i>
                  <i className='material-icons ml-2 text-yellow-600'>star</i>
                </div>
              </div> */}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
