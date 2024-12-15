import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Edit, Trash2 } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { deleteSetup } from '../actions/save-setup'
import { useToast } from "@/components/ui/use-toast"
import { UserSetup } from '@/app/types/user'

interface UserSetupsListProps {
  setups: UserSetup[]
  onUpdate: () => void
  onEdit: (setupId: string) => void
  selectedStrategyId: string | null
}

const UserSetupsList: React.FC<UserSetupsListProps> = ({ setups, onUpdate, onEdit, selectedStrategyId }) => {
  const { toast } = useToast()

  const getTagColor = (tag: string): string => {
    if (tag.includes('Moving Average') || tag.includes('MACD')) return 'bg-blue-500'
    if (tag.includes('RSI') || tag.includes('Stochastic')) return 'bg-green-500'
    if (tag.includes('Bollinger') || tag.includes('ATR')) return 'bg-red-500'
    if (tag.includes('Volume')) return 'bg-purple-500'
    if (tag.includes('Custom') || tag.includes('Advanced')) return 'bg-pink-800'
    if (tag.includes('Composite')) return 'bg-[#611C35]'
    if (tag.includes('Economic')) return 'bg-yellow-500'
    if (tag.includes('Company')) return 'bg-orange-500'
    if (tag.includes('Market Structure')) return 'bg-pink-500'
    if (tag.includes('Reversal')) return 'bg-teal-500'
    if (tag.includes('Continuation')) return 'bg-indigo-500'
    if (tag.includes('Exotic')) return 'bg-violet-500'
    if (tag.includes('Candlestick')) return 'bg-cyan-500'
    if (tag.includes('Advanced Concepts')) return 'bg-green-500'
    if (tag.includes('Entry') || tag.includes('Exit')) return 'bg-amber-500'
    return 'bg-gray-500'
  }

  const handleDelete = async (setupId: string) => {
    try {
      await deleteSetup(setupId)
      onUpdate()
      toast({
        title: "Setup deleted",
        description: "The trade setup has been successfully deleted.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete the trade setup. Please try again.",
        variant: "destructive",
      })
    }
  }

  const filteredSetups = selectedStrategyId
    ? setups.filter(setup => setup.strategy_id === selectedStrategyId)
    : setups

  return (
    <Card className="w-full h-full flex flex-col">
      <CardHeader>
        <CardTitle>Your Trade Setups</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow overflow-hidden">
        <div className="h-full overflow-y-auto pr-2">
          {filteredSetups.length === 0 ? (
            <p>No setups found for the selected strategy. Create your first setup!</p>
          ) : (
            filteredSetups.map((setup) => (
              <div key={setup.id} className="mb-4 p-4 border rounded-lg">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-lg font-semibold">{setup.setup_name}</h3>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm" onClick={() => onEdit(setup.id)}>
                      <Edit className="h-4 w-4" />
                      <span className="sr-only">Edit setup</span>
                    </Button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm">
                          <Trash2 className="h-4 w-4" />
                          <span className="sr-only">Delete setup</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently delete your
                            trade setup.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(setup.id)}>
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
                <p className="text-sm text-gray-500">
                  Created on {new Date(setup.created_at).toLocaleDateString()}
                </p>
                <div className="mt-2">
                  {setup.tags.map((tag) => (
                    <Badge key={tag} className={`mr-1 mb-1 ${getTagColor(tag)} text-white`}>
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

export default UserSetupsList

