import { DishPlate } from '@/components/dishes'

export default function Preview() {
  const bites = [
    { x: 300, y: 130, r: 44, seed: 1 },
    { x: 150, y: 260, r: 44, seed: 2 },
  ]
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24, padding: 24, background: '#F5B323' }}>
      {(['biryani', 'parotta', 'pizza', 'jamun'] as const).map((d) => (
        <div key={d}>
          <DishPlate dish={d} />
          <DishPlate dish={d} bites={bites} />
          <div style={{ width: 84 }}><DishPlate dish={d} /></div>
        </div>
      ))}
    </div>
  )
}
