/*
 * file: AdminDashboard.tsx
 * page: AdminDashboard
 * description:
 *     Administrator dashboard for monitoring game statistics.
 *     - Displays total players and games played
 *     - Shows ranking of top players by wins
 *     - Fetches data from backend using `useApi` hook with Zod validation
 *
 * usage:
 *     Import and include this page in your routing (e.g. react-router).
 *     <Route path="/admin" element={<AdminDashboard />} />
 */

import { useApi } from '../hooks/useApi'
import { z } from 'zod'
import { Award, Users, Swords, RefreshCw } from 'lucide-react'


// Schemas for API validation

const PlayerSchema = z.object({
  id: z.number(),
  name: z.string(),
  wins: z.number(),
})

const RankingSchema = z.object({
  players: z.array(PlayerSchema),
})

const GeneralStatsSchema = z.object({
  totalGames: z.number(),
  totalPlayers: z.number(),
})


// UI Components

interface StatCardProps {
  title: string
  value: string | number
  icon: React.ElementType
}

/** Card component for individual statistics */
const StatCard = ({ title, value, icon: Icon }: StatCardProps) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg flex items-center gap-4">
    <div className="p-3 bg-cyan-100 dark:bg-cyan-900 rounded-full">
      <Icon className="text-cyan-600 dark:text-cyan-300" size={28} />
    </div>
    <div>
      <p className="text-gray-500 dark:text-gray-400 text-sm">{title}</p>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  </div>
)


// Main Page Component

const AdminDashboard = () => {
  const {
    data: rankingData,
    isLoading: isRankingLoading,
    error: rankingError,
    refetch: refetchRanking,
  } = useApi('stats/ranking', RankingSchema)

  const {
    data: generalData,
    isLoading: isGeneralLoading,
    error: generalError,
    refetch: refetchGeneral,
  } = useApi('stats/general', GeneralStatsSchema)

  /** Refetch both API calls */
  const handleRefresh = () => {
    refetchRanking()
    refetchGeneral()
  }

  /** Render the page body depending on API state */
  const renderContent = () => {
    if (isRankingLoading || isGeneralLoading)
      return <p className="text-center mt-8">Loading dashboard data...</p>

    if (rankingError || generalError)
      return (
        <p className="text-center text-red-500 mt-8">
          Error: {rankingError || generalError}
        </p>
      )

    return (
      <>
        {/* General Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <StatCard
            title="Total Players"
            value={generalData?.totalPlayers ?? 'N/A'}
            icon={Users}
          />
          <StatCard
            title="Total Games Played"
            value={generalData?.totalGames ?? 'N/A'}
            icon={Swords}
          />
        </div>

        {/* Player Ranking */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-lg">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Award /> Top Player Ranking
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="border-b-2 border-gray-200 dark:border-gray-700">
                <tr>
                  <th className="p-3">Rank</th>
                  <th className="p-3">Player</th>
                  <th className="p-3 text-right">Wins</th>
                </tr>
              </thead>
              <tbody>
                {rankingData?.players.map((player, index) => (
                  <tr
                    key={player.id}
                    className="border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50"
                  >
                    <td className="p-3 font-bold">{index + 1}</td>
                    <td className="p-3">{player.name}</td>
                    <td className="p-3 text-right font-semibold">
                      {player.wins}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </>
    )
  }

  return (
    <div className="container mx-auto p-4 md:p-8 bg-gray-100 dark:bg-gray-900 min-h-screen text-gray-800 dark:text-gray-200">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold">Admin Dashboard</h1>
        <button
          onClick={handleRefresh}
          className="flex items-center gap-2 px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 transition-colors"
        >
          <RefreshCw size={18} /> Refresh
        </button>
      </div>
      {renderContent()}
    </div>
  )
}

export default AdminDashboard
