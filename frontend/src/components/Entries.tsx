import React, {useEffect, useState} from 'react';

    interface GameEntryData {
        title: string;
        releaseYear: string;
        remasterYear: string;
        rating: string;
        thoughts: string;
        platform: string;
        replay: boolean;
        modded: boolean;
        dropped: boolean;
    }

    const GameEntryTable: React.FC = () => {
        const [entries, setEntries] = useState<GameEntryData[]>([]);
        const [formData, setFormData] = useState<GameEntryData>({
            title: '',
            releaseYear: '',
            remasterYear: '',
            rating: '',
            thoughts: '',
            platform: '',
            replay: false,
            modded: false,
            dropped: false
        });

        useEffect(() => {
            const fetchData = async () => {
                try {
                    const result = await fetch('http://localhost:3001/api/getList',
                        {method: 'POST', headers: new Headers({'Content-Type': 'application/json'}),});
                    const data = await result.json();
                    const formattedData: GameEntryData[] = data.map((item: any) => ({
                        title: item.game_name || '',
                        releaseYear: item.release_year || '',
                        remasterYear: item.remaster_year || '',
                        rating: item.rating || '',
                        thoughts: item.thoughts || '',
                        platform: item.platform || '',
                        replay: item.replay ?? false,
                        modded: item.modded ?? false,
                    }));
                    setEntries(formattedData);
                } catch (error) {
                    console.error('Error fetching data:', error);
                }
            };
            fetchData();
        }, []);

        const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;

            setFormData((prevData) => ({
                ...prevData,
                [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
            }));
        };

        const handleDelete = (index: number) => {
            setEntries(entries.filter((_, i) => i !== index)); // Remove entry by index
        };

        const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            fetch("http://localhost:3001/api/addGame", {
                method: "POST",
                body: JSON.stringify(formData),
                headers: {
                    "Content-type": "application/json; charset=UTF-8"
                }
            }).then(res => {
                if (!res.ok) {
                    throw new Error("Failed to add game entry, server responsed with " + res.statusText);
                    res.json();
                }
            }).then((data) => {
                    setEntries((prevEntries) => [...prevEntries, formData]);
                    setFormData({
                        title: '',
                        releaseYear: '',
                        remasterYear: '',
                        rating: '',
                        thoughts: '',
                        platform: '',
                        replay: false,
                        modded: false,
                        dropped: false
                    });
                })
            .catch((error => {
                    console.error("Error adding game:", error);
                    alert("Failed to add the game. Please try again.");
                })
            );
            console.log(formData);
        };

        return (
            <div>
                <form onSubmit={handleSubmit} className="game-entry-form">
                    <div>
                        <label>
                            Title
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Release Year
                            <input
                                type="number"
                                name="releaseYear"
                                value={formData.releaseYear}
                                onChange={handleChange}
                                min="1970"
                                max={new Date().getFullYear()}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Remaster Year
                            <input
                                type="number"
                                name="remasterYear"
                                value={formData.remasterYear}
                                onChange={handleChange}
                                min="1970"
                                max={new Date().getFullYear()}
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Rating
                            <input
                                type="number"
                                name="rating"
                                value={formData.rating}
                                onChange={handleChange}
                                min="0"
                                max="10"
                                step="0.5"
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Thoughts:
                            <textarea
                                name="thoughts"
                                value={formData.thoughts}
                                onChange={handleChange}
                                rows={2}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            Platform:
                            <input
                                type="text"
                                name="platform"
                                value={formData.platform}
                                onChange={handleChange}
                                required
                            />
                        </label>
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                name="replay"
                                checked={formData.replay}
                                onChange={handleChange}
                            />
                            Replay
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="modded"
                                checked={formData.modded}
                                onChange={handleChange}
                            />
                            Modded
                        </label>
                        <label>
                            <input
                                type="checkbox"
                                name="dropped"
                                checked={formData.dropped}
                                onChange={handleChange}
                            />
                            Dropped
                        </label>
                    </div>
                    <button type="submit">Add Entry</button>
                </form>

                <h2>Game Entries</h2>
                <table style={{width: '100%', marginTop: '20px', textAlign: 'left'}}>
                    <thead>
                    <tr>
                        <th>Title</th>
                        <th>Release Year</th>
                        <th>Rating</th>
                        <th>Thoughts</th>
                        <th>Platform</th>
                        <th>Replay</th>
                        <th>Modded</th>
                        <th>Dropped</th>
                    </tr>
                    </thead>
                    <tbody>
                    {entries.map((entry, index) => (
                        <tr key={index}>
                            <td>{entry.title}</td>
                            <td> {`${entry.releaseYear}${entry.remasterYear !== '' ? ` (${entry.remasterYear})` : ""}`} </td>
                            <td>{entry.rating}</td>
                            <td>{entry.thoughts}</td>
                            <td>{entry.platform}</td>
                            <td>
                                <input type="checkbox" checked={entry.replay} disabled/>
                            </td>
                            <td>
                                <input type="checkbox" checked={entry.modded} disabled/>
                            </td>
                            <td>
                                <input type="checkbox" checked={entry.dropped} disabled/>
                            </td>
                            <button
                                onClick={() => handleDelete(index)}
                                className="delete-button"
                            >
                            </button>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        );
    };

export default GameEntryTable;