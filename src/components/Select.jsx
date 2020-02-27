import React, { memo, useEffect, useState } from 'react'
import { MenuItem, Icon as BpIcon } from '@blueprintjs/core'
import { Select as BpSelect } from '@blueprintjs/select'
import { AutoSizer, List } from 'react-virtualized'

import highlight from '../helpers/highlight'


const noRowStyled = {
    padding: '0 0.5em',
    height: 30,
    lineHeight: 2.2,
    textAlign: 'center'
}

const Select = ({
    id,
    name,
    value,
    onChange,
    items = [],
    itemId,
    itemLabel,
    required,
    placeholder,
    disabled,
    useClear
}) => {
    const [selectedItem, setSelectedItem] = useState(null)
    const [isOpen, setIsOpen] = useState(false)
    const renderLabel = o => typeof itemLabel === 'function' ? itemLabel(o) : o[itemLabel]

    useEffect(() => {
        const item = items.find(x => x[itemId] === value)
        setSelectedItem(item)
    }, [value, items, itemId])

    const itemListPredicate = (query, itemlist) => {
        return itemlist.filter(o => renderLabel(o).toString().toLowerCase().includes(query.toLowerCase()))
    }

    const itemListRenderer = ({ query, activeItem }) => {
        const dataFiltered = items.filter(o => renderLabel(o).toString().toLowerCase().includes(query.toLowerCase()))        
        const activeIndex = selectedItem ? dataFiltered.findIndex(o => o[itemId] === selectedItem[itemId]) : -1

        return (
            <div className='select-wrapper'>
                <AutoSizer disableHeight>
                    {({ width }) => (
                        <List
                            width={width}
                            height={dataFiltered.length > 7 ? 210 : (dataFiltered.length > 0 ? dataFiltered.length * 30 : 30)}
                            className='select-list'
                            rowCount={dataFiltered.length}
                            overscanRowCount={10}
                            rowHeight={30}
                            rowRenderer={xn => _rowRenderer(xn, dataFiltered, activeIndex, query)}
                            noRowsRenderer={() => <div style={noRowStyled}>No data.</div>}
                            scrollToIndex={activeIndex}
                        />
                    )}
                </AutoSizer>
            </div>
        )
    }

    const _rowRenderer = (xn, dataFilteredMemo, activeIndex, query) => {
        const { index, key, style } = xn
        const item = dataFilteredMemo[index]

        return (
            <div key={key} onClick={() => itemChoose(item)} style={style} className={activeIndex === index ? 'active bg-blue-300 text-white hover:bg-blue-500' : 'hover:bg-blue-500 hover:text-white'}>{highlight(renderLabel(item), query)}</div>
        )
    }

    const itemChoose = item => {
        onChange({ target: { id, name, value: item[itemId] } }, item)
        setSelectedItem(item)
        setIsOpen(false)
    }
    
    const unsetSelectedItem = () => {
        onChange({ target: { id, name, value: null } }, {})
        setSelectedItem(null)
        setIsOpen(true)
    }
        
    const handleClick = () => setIsOpen(true)
    const handleBlur = () => setTimeout(() => setIsOpen(false), 170)

    return (
        <BpSelect
            fill
            id={id}
            name={name}
            items={items || []}
            itemListRenderer={itemListRenderer}
            itemListPredicate={itemListPredicate}
            noResults={<MenuItem disabled={true} text='Tidak ada data.' />}
            popoverProps={{ usePortal: false, inline: true, minimal: true, isOpen }}
            inputProps={{ onBlur: handleBlur }}
            onItemSelect={(item, a, b) => itemChoose(item, a, b)}
            className='select'
            disabled={disabled}
        >

            <button
                onClick={handleClick}
                type="button"
                disabled={disabled}
                className='flex shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 bg-white justify-between focus:outline-none focus:shadow-outline border-blue-300'
            >
                {selectedItem ? renderLabel(selectedItem) : (
                        <div className='text-gray-300'>
                            {placeholder ? placeholder : ''}
                        </div>
                    )}
                {useClear && !required ?
                    (selectedItem ? <BpIcon onClick={disabled ? null : unsetSelectedItem} icon='cross' /> : <BpIcon icon='double-caret-vertical' />)
                    :
                    <BpIcon icon='double-caret-vertical' />
                }
            </button>
        </BpSelect>
    )
}

export default memo(Select, (p, n) =>
    p.label === n.label &&
    p.labelHelper === n.labelHelper &&
    p.value === n.value &&
    p.required === n.required &&
    p.disabled === n.disabled &&
    (p.items.length === n.items.length && p.items.every((o, i) => o === n.items[i]))
)